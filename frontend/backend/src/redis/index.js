import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_CLIENT);

if (redisClient) console.log("redis connected!!");

export default redisClient;
