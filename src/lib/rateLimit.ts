export type RateLimitInfo = {
    count: number;
    lastReset: number;
};

const rateLimitMap = new Map<string, RateLimitInfo>();

export function rateLimit(ip: string, limit: number = 20, windowMs: number = 60000) {
    const now = Date.now();
    const info = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

    if (now - info.lastReset > windowMs) {
        info.count = 0;
        info.lastReset = now;
    }

    if (info.count >= limit) {
        return { success: false, limit, remaining: 0, reset: info.lastReset + windowMs };
    }

    info.count += 1;
    rateLimitMap.set(ip, info);

    return {
        success: true,
        limit,
        remaining: limit - info.count,
        reset: info.lastReset + windowMs,
    };
}
