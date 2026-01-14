"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AlertCircle, TrendingUp } from "lucide-react";
import APICard from "@/components/ui/APICard";
import ChartCard from "@/components/ui/ChartCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { getConfigsWithStatus } from "@/services/apiConfig";
import { getMonitorLogs } from "@/services/monitorLogs";
import { useSettings } from "@/context/SettingsProvider";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import { timeAgo } from "@/utils/timeAgo";

import APICardSkeleton from "@/components/ui/APICardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { Database } from "lucide-react";

import { BarChart3 } from "lucide-react";



type UiApiCard = {
    id: string; // ✅ Mongo ID is string
    name: string;
    method: string;
    status: "healthy" | "slow" | "down";
    responseTime: number | null;
    sparklineData: number[];
};

export default function Dashboard() {
    const { settings } = useSettings();
    const { toast, show, close } = useToast();


    const [configs, setConfigs] = useState<any[]>([]);
    const [apiCards, setApiCards] = useState<UiApiCard[]>([]);
    const [loading, setLoading] = useState(true);

    const [responseTimeData, setResponseTimeData] = useState<
        { time: string; ms: number }[]
    >([]);

    // ✅ classify uses dynamic threshold from settings
    const classify = useCallback(
        (latest: any): "healthy" | "slow" | "down" => {
            if (!latest) return "down";
            if (latest.isUp === false) return "down";
            if ((latest.responseTime ?? 0) > settings.slowThresholdMs) return "slow";
            return "healthy";
        },
        [settings.slowThresholdMs]
    );

    const loadConfigs = useCallback(async () => {
        try {
            const data = await getConfigsWithStatus();
            setConfigs(data);
            return data;
        } catch (error) {
            console.error("Dashboard loadConfigs failed:", error);
            show("error", "Failed to load API configurations.");
            setConfigs([]);
            return [];
        }
    }, []);

    const buildApiCards = useCallback(
        async (withStatus: any[]) => {
            const list = withStatus.slice(0, 6);

            const cards: UiApiCard[] = await Promise.all(
                list.map(async (c) => {
                    let sparklineData: number[] = [];
                    try {
                        const logs = await getMonitorLogs(c._id, 7);
                        sparklineData = logs
                            .slice()
                            .reverse()
                            .map((l: any) => (l.isUp ? l.responseTime : 0));
                    } catch {
                        sparklineData = [];
                    }

                    const latest = c.latest;
                    const status = classify(latest);

                    return {
                        id: c._id,
                        name: c.name,
                        method: c.method,
                        status,
                        responseTime: latest?.isUp ? latest.responseTime ?? null : null,
                        sparklineData,
                    };
                })
            );

            setApiCards(cards);
        },
        [classify]
    );

    const buildGlobalResponseTimeChart = useCallback(async (withStatus: any[]) => {
        const points = withStatus
            .filter((c) => c.latest?.isUp && typeof c.latest?.responseTime === "number")
            .map((c) => ({
                time: new Date(c.latest.checkedAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                ms: c.latest.responseTime,
            }))
            .slice(0, 12)
            .reverse();

        setResponseTimeData(points);
    }, []);

    // ✅ Combined reload function (clean)
    const reloadDashboard = useCallback(async () => {
        const data = await loadConfigs();
        await buildApiCards(data);
        await buildGlobalResponseTimeChart(data);
    }, [loadConfigs, buildApiCards, buildGlobalResponseTimeChart]);

    // ✅ auto refresh based on settings
    useEffect(() => {
        let timer: any;

        async function init() {
            setLoading(true);
            try {
                await reloadDashboard();
            } finally {
                setLoading(false);
            }

            timer = setInterval(() => {
                reloadDashboard();
            }, settings.uiRefreshSec * 1000);
        }

        init();
        return () => clearInterval(timer);
    }, [reloadDashboard, settings.uiRefreshSec]);

    // counts
    const counts = useMemo(() => {
        const res = { healthy: 0, slow: 0, down: 0 };
        for (const c of configs) {
            const s = classify(c.latest);
            res[s]++;
        }
        return res;
    }, [configs, classify]);

    const lastSeenCheck = useMemo(() => {
        const latestTimes = configs
            .map((c) => c.latest?.checkedAt)
            .filter(Boolean)
            .map((t) => new Date(t).getTime());
        if (latestTimes.length === 0) return null;
        return new Date(Math.max(...latestTimes));
    }, [configs]);

    const monitoringActive = useMemo(() => {
        if (!lastSeenCheck) return false;
        return Date.now() - lastSeenCheck.getTime() < 2 * 60 * 1000; // last 2 min
    }, [lastSeenCheck]);

    const avgResponseTime = useMemo(() => {
        const times = configs
            .filter((c) => c.latest?.isUp && typeof c.latest.responseTime === "number")
            .map((c) => c.latest.responseTime);

        if (times.length === 0) return null;
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }, [configs]);

    const uptimePercent = useMemo(() => {
        if (configs.length === 0) return null;
        const up = configs.filter((c) => c.latest?.isUp).length;
        return Math.round((up / configs.length) * 1000) / 10;
    }, [configs]);

    const uptimeData = useMemo(() => {
        const up = uptimePercent ?? 0;
        return [
            { name: "Uptime", value: up, color: "#10B981" },
            { name: "Downtime", value: Math.max(0, 100 - up), color: "#EF4444" },
        ];
    }, [uptimePercent]);

    const alerts = useMemo(() => {
        const list: Array<{
            id: string;
            api: string;
            message: string;
            severity: "error" | "warning";
        }> = [];

        configs.forEach((c) => {
            const latest = c.latest;
            const status = classify(latest);

            if (status === "down") {
                list.push({
                    id: c._id,
                    api: c.name,
                    message: latest?.error || "API is down",
                    severity: "error",
                });
            } else if (status === "slow") {
                list.push({
                    id: c._id,
                    api: c.name,
                    message: `Response time above ${settings.slowThresholdMs}ms (${latest?.responseTime}ms)`,
                    severity: "warning",
                });
            }
        });



        return list.slice(0, 3);
    }, [configs, classify, settings.slowThresholdMs]);


    const hasApis = configs.length > 0;
    const hasResponseChart = responseTimeData.length > 0;



    return (
        <div className="space-y-8">

            <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl overflow-hidden border border-indigo-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left: Header Content */}
                    <div className="p-8 lg:p-12">
                        <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4
  ${monitoringActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${monitoringActive ? "bg-green-600 animate-pulse" : "bg-gray-500"
                                    }`}
                            />
                            {monitoringActive ? "Monitoring Active" : "Monitoring Paused"}
                        </div>

                        {lastSeenCheck && (
                            <p className="text-xs text-gray-500 mt-2">
                                Last check: {timeAgo(lastSeenCheck)}
                            </p>
                        )}

                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Real-time API health monitoring with automated checks every minute.
                            Track response times, uptime percentages, and get instant alerts when
                            issues arise.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">
                                    {counts.healthy} Healthy
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">{counts.slow} Slow</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">{counts.down} Down</span>
                            </div>
                        </div>
                    </div>

                    {/* Right illustration unchanged */}
                    <div className="relative h-64 lg:h-80">
                        <div className="absolute inset-0 p-8 lg:p-12">
                            <div className="space-y-3">
                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-indigo-100 transform -rotate-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                                    </div>
                                    <div className="flex items-end gap-1 h-12">
                                        {[60, 80, 65, 90, 85, 70, 95].map((height, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-indigo-100 transform rotate-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="text-xs font-bold text-indigo-600">
                                            {avgResponseTime ?? "—"}ms
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-red-100 transform -rotate-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 bg-red-100 rounded flex-1"></div>
                                        <div className="text-xs font-semibold text-red-600">Alert</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 w-16 h-16 bg-indigo-100 rounded-full opacity-50 blur-2xl"></div>
                            <div className="absolute bottom-4 left-4 w-20 h-20 bg-purple-100 rounded-full opacity-50 blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex items-start gap-3 p-4 rounded-lg border ${alert.severity === "error"
                                ? "bg-red-50 border-red-200"
                                : "bg-amber-50 border-amber-200"
                                }`}
                        >
                            <AlertCircle
                                className={`w-5 h-5 mt-0.5 ${alert.severity === "error" ? "text-red-600" : "text-amber-600"
                                    }`}
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{alert.api}</p>
                                <p className="text-sm text-gray-600">{alert.message}</p>
                            </div>
                            <StatusBadge status={alert.severity === "error" ? "down" : "slow"} slowThresholdMs={settings.slowThresholdMs} />
                        </div>
                    ))}
                </div>
            )}

            {/* API Cards */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">API Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => <APICardSkeleton key={i} />)
                    ) : configs.length === 0 ? (
                        <div className="lg:col-span-3">
                            <EmptyState
                                title="No APIs configured"
                                description="Add your first API from API Management to start monitoring."
                                icon={<Database className="w-6 h-6 text-indigo-600" />}
                            />
                        </div>
                    ) : (
                        apiCards.map((api) => <APICard key={api.id} api={api} />)
                    )}
                </div>

            </div>

            {/* Charts */}
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Response Time Chart */}
                <ChartCard title="Average Response Time" className="lg:col-span-2">
                    {!hasApis || !hasResponseChart ? (
                        <EmptyState
                            title="No response time data"
                            description="Add APIs and wait for the first monitoring cycle to generate charts."
                            icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                        />
                    ) : (
                        <div style={{ width: "100%", height: 240, minHeight: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={responseTimeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        axisLine={{ stroke: "#E5E7EB" }}
                                    />
                                    <YAxis
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        axisLine={{ stroke: "#E5E7EB" }}
                                        label={{
                                            value: "ms",
                                            angle: -90,
                                            position: "insideLeft",
                                            fill: "#6B7280",
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="ms"
                                        stroke="#4F46E5"
                                        strokeWidth={2}
                                        dot={{ fill: "#4F46E5", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ChartCard>

                {/* Uptime Chart */}
                <ChartCard title="Uptime">
                    {!hasApis ? (
                        <EmptyState
                            title="No uptime data"
                            description="Once you add APIs, uptime will be calculated automatically."
                            icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                        />
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center"
                            style={{ height: 240, minHeight: 240 }}
                        >
                            <div style={{ width: "100%", height: 180, minHeight: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={uptimeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {uptimeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center -mt-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {uptimePercent ?? "—"}%
                                </p>
                                <p className="text-sm text-gray-600">Overall Uptime</p>
                            </div>
                        </div>
                    )}
                </ChartCard>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-2">Total APIs</p>
                    <p className="text-3xl font-bold text-gray-900">{configs.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-2">Healthy APIs</p>
                    <p className="text-3xl font-bold text-gray-900">{counts.healthy}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-2">Avg Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {avgResponseTime ?? "—"}
                        <span className="text-lg text-gray-600 ml-1">ms</span>
                    </p>
                </div>
            </div>
            <Toast toast={toast} onClose={close} />
        </div>
    );
}
