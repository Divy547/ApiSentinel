"use client";
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import MethodBadge from './MethodBadge';
import StatusBadge from './StatusBadge';
import AddEditAPIModal from './AddEditAPIModal';
import { deleteApiConfig, getConfigsWithStatus } from '@/services/apiConfig';
import { useSettings } from "@/context/SettingsProvider"; // ✅ NEW

import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";


export default function APIManagement() {
    const { settings } = useSettings(); // ✅ NEW (slowThresholdMs)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAPI, setEditingAPI] = useState<any>(null);
    const [apis, setApis] = useState<any[]>([]);

    const { toast, show, close } = useToast();
    const [loading, setLoading] = useState(true);

    async function fetchApis() {
        setLoading(true);
        try {
            const data = await getConfigsWithStatus();
            setApis(data);
        } catch (err) {
            console.error("Failed to fetch APIs:", err);
            show("error", "Failed to load API configurations.");
        } finally {
            setLoading(false);
        };
    }

    useEffect(() => {
        fetchApis();
    }, []);

    const handleEdit = (api: any) => {
        setEditingAPI(api);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingAPI(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this API configuration?")) return;

        try {
            await deleteApiConfig(id);
            show("success", "API configuration deleted successfully.");
            fetchApis();
        } catch (err) {
            console.error("Delete failed:", err);
            show("error", "Failed to delete API configuration.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">API Management</h1>
                    <p className="text-gray-600">Manage your API configurations</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-transparent border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add API
                </button>
            </div>

            {/* API Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : apis.length === 0 ? (
                        <EmptyState
                            title="No APIs added yet"
                            description="Add your first API to start monitoring uptime and response time."
                            action={
                                <button
                                    onClick={handleAdd}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add API
                                </button>
                            }
                        />
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        API Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        URL
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Last Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {apis.map((api, index) => {
                                    const latest = api.latest;

                                    // ✅ Map backend latest log -> UI status string
                                    let badgeStatus: "healthy" | "slow" | "down" | "unknown" = "unknown";

                                    if (!latest) badgeStatus = "unknown";
                                    else if (latest.isUp === false) badgeStatus = "down";
                                    else if ((latest.responseTime ?? 0) > settings.slowThresholdMs) badgeStatus = "slow"; // ✅ dynamic threshold
                                    else badgeStatus = "healthy";

                                    return (
                                        <tr
                                            key={api._id}
                                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                }`}
                                        >
                                            {/* Name */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{api.name}</p>

                                                {/* ✅ checkedAt instead of createdAt */}
                                                {latest?.checkedAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Last checked: {new Date(latest.checkedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Method */}
                                            <td className="px-6 py-4">
                                                <MethodBadge method={api.method} />
                                            </td>

                                            {/* URL */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 font-mono truncate max-w-[420px]">
                                                    {api.url}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={badgeStatus} slowThresholdMs={settings.slowThresholdMs} />

                                                {latest?.statusCode != null && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Code: {latest.statusCode}
                                                        {latest.responseTime != null
                                                            ? ` • ${latest.responseTime}ms`
                                                            : ""}
                                                    </p>
                                                )}

                                                {latest?.error && (
                                                    <p className="text-xs text-red-600 mt-1 truncate max-w-[240px]">
                                                        {latest.error}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(api)}
                                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(api._id)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}


                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <AddEditAPIModal
                    open={isModalOpen}
                    api={editingAPI}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingAPI(null);
                    }}
                    onSaved={() => {
                        setIsModalOpen(false);
                        setEditingAPI(null);
                        fetchApis();
                    }}
                />
            )}

            {/* Floating Add Button */}
            {!isModalOpen && (
                <button
                    onClick={handleAdd}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
            <Toast toast={toast} onClose={close} />
        </div>
    );
}
