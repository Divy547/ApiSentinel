export const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
export type method = typeof ALLOWED_METHODS[number];

export interface ApiTest {
  method: method;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  timeOutMs?: number;
}