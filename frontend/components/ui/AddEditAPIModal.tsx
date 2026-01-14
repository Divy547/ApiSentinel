"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createApiConfig, updateApiConfig } from "@/services/apiConfig";

type Props = {
    open: boolean;
    api?: any | null;
    onClose: () => void;
    onSaved: () => void;
};

export default function AddEditAPIModal({ open, api, onClose, onSaved }: Props) {
    // ✅ prevent rendering when closed
    if (!open) return null;

    const isEdit = Boolean(api?._id);

    const [name, setName] = useState(api?.name || "");
    const [method, setMethod] = useState(api?.method || "GET");
    const [url, setUrl] = useState(api?.url || "");
    const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
        api?.headers?.length ? api.headers : [{ key: "", value: "" }]
    );
    const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>(
        api?.queryParams?.length ? api.queryParams : [{ key: "", value: "" }]
    );
    const [body, setBody] = useState(
        api?.body ? JSON.stringify(api.body, null, 2) : ""
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const normalizeKV = (data: any) => {
        if (!data) return [{ key: "", value: "" }];
        if (Array.isArray(data)) return data;
        // if object/map
        return Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) }));
    };

    // ✅ when switching between add/edit, refresh states
    useEffect(() => {
        setName(api?.name || "");
        setMethod(api?.method || "GET");
        setUrl(api?.url || "");
        setHeaders(normalizeKV(api?.headers));
        setQueryParams(normalizeKV(api?.queryParams));
        setBody(api?.body ? JSON.stringify(api.body, null, 2) : "");
        setError(null);
    }, [api]);

    const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
    const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
    const updateHeader = (index: number, field: "key" | "value", value: string) => {
        const next = [...headers];
        next[index][field] = value;
        setHeaders(next);
    };

    const addQueryParam = () => setQueryParams([...queryParams, { key: "", value: "" }]);
    const removeQueryParam = (index: number) =>
        setQueryParams(queryParams.filter((_, i) => i !== index));
    const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
        const next = [...queryParams];
        next[index][field] = value;
        setQueryParams(next);
    };

    // ✅ helper: array-of-kv -> object for backend Map
    const toObject = (items: { key: string; value: string }[]) =>
        items.reduce((acc, item) => {
            const k = item.key?.trim();
            if (k) acc[k] = item.value ?? "";
            return acc;
        }, {} as Record<string, string>);

    async function handleSave() {
        setError(null);

        if (!name.trim()) return setError("API Name is required.");
        if (!url.trim()) return setError("URL is required.");

        // ✅ Parse JSON body safely
        let parsedBody: any = undefined;
        if (body.trim()) {
            try {
                parsedBody = JSON.parse(body);
            } catch {
                return setError("Request Body must be valid JSON.");
            }
        }

        const payload = {
            name: name.trim(),
            method, // GET/POST/PUT/DELETE
            url: url.trim(),
            headers: toObject(headers),
            queryParams: toObject(queryParams),
            body: parsedBody,
        };

        setLoading(true);
        try {
            if (isEdit) {
                await updateApiConfig(api._id, payload);
            } else {
                await createApiConfig(payload);
            }

            // ✅ success
            onSaved();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Failed to save API config.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEdit ? "Edit API" : "Add New API"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {error && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Auth Service"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    {/* Method and URL */}
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Method
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                {/* ❌ PATCH removed because backend enum doesn’t allow it */}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://api.example.com/endpoint"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Headers */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Headers
                            </label>
                            <button
                                onClick={addHeader}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {headers.map((header, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={header.key}
                                        onChange={(e) => updateHeader(index, "key", e.target.value)}
                                        placeholder="Key"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={header.value}
                                        onChange={(e) => updateHeader(index, "value", e.target.value)}
                                        placeholder="Value"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                                    />
                                    <button
                                        onClick={() => removeHeader(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Query Params */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Query Parameters
                            </label>
                            <button
                                onClick={addQueryParam}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {queryParams.map((param, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={param.key}
                                        onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                                        placeholder="Key"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={param.value}
                                        onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                                        placeholder="Value"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                                    />
                                    <button
                                        onClick={() => removeQueryParam(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Request Body (JSON)
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder='{\n  "key": "value"\n}'
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : isEdit ? "Save Changes" : "Add API"}
                    </button>
                </div>
            </div>
        </div>
    );
}
