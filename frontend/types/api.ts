export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type KVPair = [string, string];

export interface ApiConfig {
  _id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KVPair[];
  queryParams: KVPair[];
  body?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecuteRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
}

export interface ExecuteResponse {
  success: boolean;
  statusCode: number | null;
  responseTime: number;
  data: any;
  headers: any;
  error: null | { type: string; message: string };
}

export interface MonitorLog {
  _id: string;
  apiConfigId: string;
  isUp: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
  createdAt: string;
}
