import { MockRule } from './types';

export const matchRule = (url: string, method: string, rules: MockRule[]): MockRule | undefined => {
  const normalizedMethod = method.toLowerCase();
  
  return rules.find((rule) => {
    if (!rule.enabled) return false;
    if (rule.method !== 'any' && rule.method !== normalizedMethod) return false;
    
    // Simple string match or check if it looks like a regex
    if (rule.url.startsWith('/') && rule.url.endsWith('/')) {
        try {
            const pattern = rule.url.slice(1, -1);
            const regex = new RegExp(pattern);
            return regex.test(url);
        } catch (e) {
            return rule.url === url;
        }
    }
    
    return url.includes(rule.url);
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
