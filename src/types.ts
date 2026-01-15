export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'any';

export interface MockRule {
  id: string;
  url: string; // can be regex string or plain string
  method: Method;
  status: number;
  delay?: number;
  response: any;
  enabled: boolean;
}

export interface LogItem {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  requestData?: any;
  responseData?: any;
  requestHeaders?: any;
  responseHeaders?: any;
  isMocked: boolean;
  duration?: number;
}

export interface MockKitState {
  logs: LogItem[];
  rules: MockRule[];
  isOpen: boolean;
}
