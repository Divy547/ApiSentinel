export interface MonitorLog {
  _id: string;
  apiConfigId: string;
  isUp: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
  checkedAt: string;
}
