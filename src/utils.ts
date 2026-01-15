import { MockRule } from './types';

// Helper to match dynamic paths like /api/users/:id
const matchDynamicPath = (requestPath: string, rulePath: string): boolean => {
    // Normalize paths by removing trailing slashes for consistent splitting
    const normalize = (p: string) => p.replace(/\/+$/, '').replace(/^\/+/, '');
    
    const reqSegments = normalize(requestPath).split('/');
    const ruleSegments = normalize(rulePath).split('/');

    if (reqSegments.length !== ruleSegments.length) return false;

    for (let i = 0; i < ruleSegments.length; i++) {
        const ruleSeg = ruleSegments[i];
        const reqSeg = reqSegments[i];

        // If rule segment starts with ':', it's a dynamic param -> match anything
        if (ruleSeg.startsWith(':')) continue;
        
        // Otherwise exact match required for this segment
        if (ruleSeg !== reqSeg) return false;
    }
    return true;
};

export const matchRule = (url: string, method: string, rules: MockRule[]): MockRule | undefined => {
  const normalizedMethod = method.toLowerCase();
  const [reqPath] = url.split('?');
  
  return rules.find((rule) => {
    if (!rule.enabled) return false;
    if (rule.method !== 'any' && rule.method !== normalizedMethod) return false;
    
    // 1. Regex Match (Full URL)
    if (rule.url.startsWith('/') && rule.url.endsWith('/')) {
        try {
            const pattern = rule.url.slice(1, -1);
            const regex = new RegExp(pattern);
            return regex.test(url);
        } catch (e) {
            // Fallback to string comparison if regex invalid
        }
    }
    
    // Split rule into path and search
    const [rulePath, ruleSearch] = rule.url.split('?');

    // 2. Exact Match Mode (Strict)
    if (rule.exactMatch) {
        return url === rule.url;
    }

    // 3. Dynamic Path Logic (Standard)
    if (rulePath.includes('/:')) {
        const pathMatches = matchDynamicPath(reqPath, rulePath);
        if (pathMatches) {
            // If rule has query params, ensure they exist in request
            if (ruleSearch) {
                return url.includes(ruleSearch);
            }
            return true;
        }
        return false;
    }

    // 4. Default/Legacy Behavior (Partial Match)
    // This allows "/api/users" to match "/api/users?q=1"
    return url.includes(rule.url);
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
