import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { ApiTest } from '../types/apiTest.js';
import { sanitizeHeaders } from '../utils/sanitizeHeaders.js';


type ApiErrorType =
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';


export async function executeApiTest(request: ApiTest) {
  const startTime = Date.now();

  // ---- Timeout Hardening ----
  const DEFAULT_TIMEOUT = 10000;
  const MAX_TIMEOUT = 30000;

  const timeout =
    typeof request.timeOutMs === 'number'
      ? Math.min(request.timeOutMs, MAX_TIMEOUT)
      : DEFAULT_TIMEOUT;

  // ---- HTTP semantics hardening ----
  const data =
    request.method === 'GET' ? undefined : request.body;

  try {
    const config: AxiosRequestConfig = {
      method: request.method,
      url: request.url,
      headers: sanitizeHeaders(request.headers) ?? {},
      params: request.queryParams,
      data,
      timeout,
      validateStatus: () => true // observe all responses
    };

    const response = await axios(config);
    const endTime = Date.now();

    return {
      success: true,                 // request executed successfully
      statusCode: response.status,   // real HTTP status
      responseTime: endTime - startTime,
      data: response.data,
      headers: sanitizeHeaders(request.headers),
      error: null
    };

  } catch (err: any) {
    const endTime = Date.now();

    let errorType: ApiErrorType = 'UNKNOWN_ERROR';
    let message = 'Request failed';

    if (err.code === 'ECONNABORTED') {
      errorType = 'TIMEOUT';
      message = 'Request timed out';
    } else if (err.response) {
      errorType = 'HTTP_ERROR';
      message = `HTTP ${err.response.status}`;
    } else if (err.request) {
      errorType = 'NETWORK_ERROR';
      message = 'Network error';
    }

    return {
      success: false,                // request did not complete
      statusCode: null,
      responseTime: endTime - startTime,
      data: null,
      headers: null,
      error: {
        type: errorType,
        message
      }
    };
  }
}
