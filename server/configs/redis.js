import Redis from "ioredis";

let redisClient = null;
let isRedisConnected = false;

const initRedis = () => {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;

    if (!redisUrl) {
        console.log("ℹ️  REDIS_URL not provided - Redis caching is disabled (fallback to DB).");
        return null;
    }

    try {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            enableReadyCheck: false,
            connectTimeout: 5000,
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > 3) {
                    return null; // Stop reconnecting after 3 tries
                }
                return Math.min(times * 1000, 3000);
            }
        });

        redisClient.on("connect", () => {
            isRedisConnected = true;
            console.log("⚡ Redis Connected Successfully ✅");
        });

        redisClient.on("error", (err) => {
            isRedisConnected = false;
            // Silent error or log once to avoid cluttering logs
            // console.warn("Redis connection warning:", err.message);
        });

        redisClient.on("close", () => {
            isRedisConnected = false;
        });

        redisClient.connect().catch((err) => {
            console.log("ℹ️  Redis unavailable (" + err.message + ") - Using MongoDB directly.");
        });

        return redisClient;
    } catch (error) {
        console.warn("⚠️  Redis init error:", error.message);
        return null;
    }
};

// Safe Cache Get
export const getCache = async (key) => {
    if (!redisClient || !isRedisConnected) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return null;
    }
};

// Safe Cache Set
export const setCache = async (key, value, ttlSeconds = 300) => {
    if (!redisClient || !isRedisConnected) return false;
    try {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await redisClient.setex(key, ttlSeconds, serialized);
        } else {
            await redisClient.set(key, serialized);
        }
        return true;
    } catch (err) {
        return false;
    }
};

// Safe Cache Delete
export const delCache = async (key) => {
    if (!redisClient || !isRedisConnected) return false;
    try {
        await redisClient.del(key);
        return true;
    } catch (err) {
        return false;
    }
};

export default initRedis;
