import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_CLIENT, { pingInterval: 1000 });

if (redisClient) console.log("redis connected!!");

export default redisClient;
