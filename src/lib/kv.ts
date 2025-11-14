import { kv as vercelKV } from "@vercel/kv";
import Redis from "ioredis";

type ZAddMember = { score: number; member: string };
type ZRangeOptions = { byScore?: boolean; rev?: boolean; count?: number };

type KVLike = {
	get: (key: string) => Promise<any>;
	set: (key: string, value: unknown) => Promise<void>;
	zadd: (key: string, member: ZAddMember) => Promise<void>;
	zrange: (key: string, min: number, max: number, options?: ZRangeOptions) => Promise<string[]>;
};

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
	if (!redisClient) {
		const url = process.env.REDIS_URL;
		if (!url) {
			throw new Error("REDIS_URL não configurada.");
		}
		redisClient = new Redis(url);
	}
	return redisClient;
}

function wrapRedis(client: Redis): KVLike {
	return {
		async get(key: string) {
			const v = await client.get(key);
			if (v == null) return null;
			try {
				return JSON.parse(v);
			} catch {
				return v;
			}
		},
		async set(key: string, value: unknown) {
			const str = typeof value === "string" ? value : JSON.stringify(value);
			await client.set(key, str);
		},
		async zadd(key: string, { score, member }: ZAddMember) {
			await client.zadd(key, score, member);
		},
		async zrange(key: string, min: number, max: number, options?: ZRangeOptions) {
			const byScore = options?.byScore;
			const rev = options?.rev;
			const count = options?.count;
			if (byScore) {
				if (rev) {
					if (count != null) {
						return client.zrevrangebyscore(key, max, min, "LIMIT", 0, count);
					}
					return client.zrevrangebyscore(key, max, min);
				} else {
					if (count != null) {
						return client.zrangebyscore(key, min, max, "LIMIT", 0, count);
					}
					return client.zrangebyscore(key, min, max);
				}
			}
			if (rev) {
				return client.zrevrange(key, min, max);
			}
			return client.zrange(key, min, max);
		},
	};
}

export function getKV(): KVLike {
	// Preferir Vercel KV quando disponível (ambientes conectados na Vercel)
	if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
		return vercelKV as unknown as KVLike;
	}
	// Fallback: Redis externo via REDIS_URL
	if (process.env.REDIS_URL) {
		return wrapRedis(getRedisClient());
	}
	throw new Error("Nenhum KV configurado. Conecte Vercel KV ou defina REDIS_URL.");
}


