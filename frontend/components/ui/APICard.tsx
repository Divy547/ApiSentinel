"use client";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import MethodBadge from './MethodBadge';
import StatusBadge from './StatusBadge';
import { useSettings } from "@/context/SettingsProvider";

interface APICardProps {
    api: {
        id: string;
        name: string;
        method: string;
        status: 'healthy' | 'slow' | 'down';
        responseTime: number | null;
        sparklineData: number[];
    };
}

export default function APICard({ api }: APICardProps) {
    const chartData = api.sparklineData.map((value, index) => ({ index, value }));
    const { settings } = useSettings();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{api.name}</h3>
                    <MethodBadge method={api.method} />
                </div>
                <StatusBadge status={api.status} slowThresholdMs={settings.slowThresholdMs}/>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Last Response Time</p>
                {api.responseTime !== null ? (
                    <p className="text-2xl font-bold text-gray-900">{api.responseTime} ms</p>
                ) : (
                    <p className="text-2xl font-bold text-red-600">—</p>
                )}
            </div>

            {/* Sparkline */}
            <div style={{ width: '100%', height: 48, minHeight: 48 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={api.status === 'healthy' ? '#10B981' : api.status === 'slow' ? '#F59E0B' : '#EF4444'}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}