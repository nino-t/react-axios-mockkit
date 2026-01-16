import * as React from 'react';
import axios, { AxiosInstance, AxiosAdapter, AxiosResponse } from 'axios';
import { useMockKit } from './context';
import { matchRule, generateId } from './utils';
import { LogItem } from './types';

export const useAxiosMockKit = (axiosInstance: AxiosInstance) => {
  const { state, dispatch } = useMockKit();
  
  // Refs to keep latest state/dispatch without re-triggering effect
  const stateRef = React.useRef(state);
  const dispatchRef = React.useRef(dispatch);

  React.useEffect(() => {
    stateRef.current = state;
    dispatchRef.current = dispatch;
  }, [state, dispatch]);

  React.useEffect(() => {
    const originalAdapter = axiosInstance.defaults.adapter;
    
    // Fallback to global axios default adapter if instance doesn't have one
    const getFallbackAdapter = () => {
        if (originalAdapter) return originalAdapter;
        return axios.defaults.adapter;
    };

    const mockAdapter: AxiosAdapter = async (config) => {
      // Construct full URL with params if they exist
      const { url, method, params } = config;
      
      let fullUrl = url || '';
      if (params && fullUrl) {
        // Use axios's internal logic or a simple serializer to append params
        // Since we don't have access to internal buildURL easily without importing it,
        // and we want to match what the user likely types in the mock rule.
        // We will use a URLSearchParams approach or axios.getUri if available (Axios 0.19+)
        try {
            // Note: axios.getUri might not be available on the instance directly inside adapter context easily 
            // without binding, but let's try to construct it manually for safety or use the instance.
            const uri = axiosInstance.getUri(config);
            const baseURL = axiosInstance.defaults.baseURL || axios.defaults.baseURL;
            if (baseURL && uri.startsWith(baseURL)) {
                fullUrl = uri.slice(baseURL.length);
            } else {
                fullUrl = uri;
            }
        } catch (e) {
            // Fallback if getUri fails or isn't available
            // This is a simple fallback and might not match custom serializers perfectly
            const queryString = new URLSearchParams(params).toString();
            if (queryString) {
                fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
            }
        }
      }

      const id = generateId();
      const startTime = Date.now();
      
      const logItem: LogItem = {
        id,
        timestamp: startTime,
        method: method?.toUpperCase() || 'GET',
        url: fullUrl,
        requestData: config.data,
        requestHeaders: config.headers,
        isMocked: false,
      };

      // Check for match using the full URL
      const matchedRule = matchRule(fullUrl, method || 'get', stateRef.current.rules);

      if (matchedRule) {
        logItem.isMocked = true;
        logItem.status = matchedRule.status;
        logItem.responseData = matchedRule.response;

        if (matchedRule.delay) {
          await new Promise((resolve) => setTimeout(resolve, matchedRule.delay));
        }

        const response: AxiosResponse = {
          data: matchedRule.response,
          status: matchedRule.status,
          statusText: matchedRule.status === 200 ? 'OK' : 'Mocked',
          headers: {},
          config,
          request: {} 
        };
        
        logItem.duration = Date.now() - startTime;
        dispatchRef.current({ type: 'ADD_LOG', payload: logItem });
        
        // Validate status code to decide resolve/reject
        if (matchedRule.status >= 200 && matchedRule.status < 300) {
            return response;
        } else {
             // For error status, axios adapter throws an error with response attached
             const error: any = new Error(`Request failed with status code ${matchedRule.status}`);
             error.response = response;
             error.config = config;
             error.code = matchedRule.status.toString();
             throw error;
        }
      }

      // Pass through
      const adapterConfig = getFallbackAdapter();
      
      try {
        let responsePromise;

        // Try to resolve adapter using axios.getAdapter (Axios 1.0+)
        if (typeof axios.getAdapter === 'function') {
            const adapter = axios.getAdapter(adapterConfig);
            responsePromise = adapter(config);
        } else if (typeof adapterConfig === 'function') {
             responsePromise = adapterConfig(config);
        } else {
             const defaultAdapter = axios.defaults.adapter as AxiosAdapter;
             if (typeof defaultAdapter === 'function') {
                 responsePromise = defaultAdapter(config);
             } else {
                 throw new Error('No valid adapter found for pass-through');
             }
        }
        
        const response = await responsePromise;
        
        logItem.status = response.status;
        logItem.responseData = response.data;
        logItem.responseHeaders = response.headers;
        logItem.duration = Date.now() - startTime;
        
        dispatchRef.current({ type: 'ADD_LOG', payload: logItem });
        
        return response;
      } catch (error: any) {
        logItem.status = error.response?.status || 0;
        logItem.responseData = error.response?.data;
        logItem.duration = Date.now() - startTime;
        dispatchRef.current({ type: 'ADD_LOG', payload: logItem });
        throw error;
      }
    };

    axiosInstance.defaults.adapter = mockAdapter;

    return () => {
      axiosInstance.defaults.adapter = originalAdapter;
    };
  }, [axiosInstance]); 
};
