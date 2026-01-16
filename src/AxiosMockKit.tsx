import * as React from 'react';
import { AxiosInstance } from 'axios';
import { MockKitProvider } from './context';
import { DevTools } from './components/DevTools';
import { useAxiosMockKit } from './useAxiosMockKit';

const MockKitInitializer = ({ instance }: { instance: AxiosInstance }) => {
    useAxiosMockKit(instance);
    return null;
};

interface AxiosMockKitProps {
    children: React.ReactNode;
    instance?: AxiosInstance; 
}

export const AxiosMockKit = ({ children, instance }: AxiosMockKitProps) => {
    return (
        <MockKitProvider>
            {instance && <MockKitInitializer instance={instance} />}
            {children}
            <DevTools />
        </MockKitProvider>
    );
};
