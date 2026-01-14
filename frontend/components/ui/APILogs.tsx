"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getConfigsWithStatus } from "@/services/apiConfig";
import { getMonitorLogs } from "@/services/monitorLogs";
import { useSettings } from "@/context/SettingsProvider"; // ✅ NEW

import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";


type UiLog = {
    id: string;
    apiName: string;
    status: "healthy" | "slow" | "down";
    responseTime: number | null;
    timestamp: string;
    error: string | null;

    checkedAt: string; // ✅ NEW: ISO string for correct filtering
};

export default function APILogs() {
    const { settings } = useSettings(); // ✅ NEW
    const { toast, show, close } = useToast();


    const [configs, setConfigs] = useState<any[]>([]);
    const [selectedAPI, setSelectedAPI] = useState<string>("all"); // stores apiConfigId
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const [rawLogs, setRawLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const PAGE_SIZE = 10;

    // load configs once
    useEffect(() => {
        async function loadConfigs() {
            try {
                const data = await getConfigsWithStatus();
                setConfigs(data);
            } catch (err) {
                console.error(err);
                show("error", "Failed to load APIs.");
            }
        }

        loadConfigs();
    }, []);

    // when API changes, fetch logs
    useEffect(() => {
        async function loadLogs() {
            if (selectedAPI === "all") {
                setRawLogs([]);
                return;
            }

            setLoading(true);
            try {
                const logs = await getMonitorLogs(selectedAPI, 200);
                setRawLogs(logs);
                setCurrentPage(1);
            } catch (err) {
                console.error(err);
                show("error", "Failed to load logs.");
            } finally {
                setLoading(false);
            }
        }
        loadLogs();
    }, [selectedAPI]);

    // map backend log -> UI status badge
    const computeBadgeStatus = (log: any): "healthy" | "slow" | "down" => {
        if (!log.isUp) return "down";
        if ((log.responseTime ?? 0) > settings.slowThresholdMs) return "slow"; // ✅ dynamic threshold
        return "healthy";
    };

    // transform backend logs into UI table format
    const logs: UiLog[] = useMemo(() => {
        if (selectedAPI === "all") return [];

        const apiName =
            configs.find((c) => c._id === selectedAPI)?.name || "Unknown API";

        return rawLogs.map((l) => ({
            id: l._id,
            apiName,
            status: computeBadgeStatus(l),
            responseTime: l.isUp ? l.responseTime : null,
            timestamp: new Date(l.checkedAt).toLocaleString(),
            error: l.error || null,

            checkedAt: l.checkedAt, // ✅ save real date for filtering
        }));
    }, [rawLogs, configs, selectedAPI, settings.slowThresholdMs]);

    // filters
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            if (selectedStatus !== "all" && log.status !== selectedStatus) return false;

            // ✅ Date filter now uses checkedAt ISO, NOT formatted timestamp
            if (fromDate) {
                const logDate = new Date(log.checkedAt);
                if (logDate < new Date(fromDate)) return false;
            }
            if (toDate) {
                const logDate = new Date(log.checkedAt);
                if (logDate > new Date(toDate + "T23:59:59")) return false;
            }

            return true;
        });
    }, [logs, selectedStatus, fromDate, toDate]);

    // pagination
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // dropdown options
    const apis = configs.map((c) => ({ id: c._id, name: c.name }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">API Logs</h1>
                <p className="text-gray-600">View historical monitoring logs and errors</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* API Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API
                        </label>
                        <select
                            value={selectedAPI}
                            onChange={(e) => setSelectedAPI(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                        >
                            <option value="all">Select an API...</option>
                            {apis.map((api) => (
                                <option key={api.id} value={api.id}>
                                    {api.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="healthy">Healthy</option>
                            <option value="slow">Slow</option>
                            <option value="down">Down</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date Range
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                                />
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <span className="flex items-center text-gray-500">to</span>
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                                />
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    API Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Response Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Error Message
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {/* ✅ Case 0: no API selected */}
                            {selectedAPI === "all" ? (
                                <tr>
                                    <td colSpan={5} className="p-6">
                                        <EmptyState
                                            title="Select an API to view logs"
                                            description="Choose an API from the dropdown above. Logs will appear after the monitoring cycle runs."
                                        />
                                    </td>
                                </tr>
                            ) : loading ? (
                                /* ✅ Case 1: loading skeleton rows */
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-4">
                                            <Skeleton className="h-6 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedLogs.length === 0 ? (
                                /* ✅ Case 2: API selected but no logs */
                                <tr>
                                    <td colSpan={5} className="p-6">
                                        <EmptyState
                                            title="No logs yet"
                                            description="Monitoring runs every minute. Wait for the next cycle or check if the API is reachable."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                /* ✅ Case 3: show logs */
                                paginatedLogs.map((log, index) => (
                                    <tr
                                        key={log.id}
                                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{log.apiName}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={log.status}
                                                slowThresholdMs={settings.slowThresholdMs}
                                            />
                                        </td>

                                        <td className="px-6 py-4">
                                            {log.responseTime !== null ? (
                                                <p className="text-sm text-gray-900">{log.responseTime} ms</p>
                                            ) : (
                                                <p className="text-sm text-gray-400">—</p>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 font-mono">{log.timestamp}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            {log.error ? (
                                                <p
                                                    className="text-sm text-red-600 truncate max-w-xs"
                                                    title={log.error}
                                                >
                                                    {log.error}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400">—</p>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>

                {/* Pagination */}
                {selectedAPI !== "all" && !loading && filteredLogs.length > 0 && (

                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-medium">
                                {filteredLogs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                                {Math.min(currentPage * PAGE_SIZE, filteredLogs.length)}
                            </span>{" "}
                            of <span className="font-medium">{filteredLogs.length}</span> results
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${currentPage === i + 1
                                            ? "bg-indigo-600 text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
