import { apiClient } from "./apiClient";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type KVPair = [string, string];
type KVObj = Record<string, string>;


export interface ApiConfigPayload {
    name: string;
    method: HttpMethod;
    url: string;
    headers: KVObj;
    queryParams: KVObj;
    body?: any;
}

export async function createApiConfig(payload: ApiConfigPayload) {
    return (await apiClient.post("/api/configs", payload)).data;
}

export async function updateApiConfig(id: string, payload: ApiConfigPayload) {
    return (await apiClient.put(`/api/configs/${id}`, payload)).data;
}

export async function deleteApiConfig(id: string) {
    return (await apiClient.delete(`/api/configs/${id}`)).data;
}


export async function getConfigsWithStatus() {
    const res = await apiClient.get("/api/configs/with-status");
    return res.data;
}
