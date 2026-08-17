import { createClient } from 'redis';
import { env } from './environment.js';

export const clientRedis = createClient({
    username: 'default',
    password: env.PASSWORD_REDIS,
    socket: {
        host: 'macrostrong-pin-tank-40257.db.redis.io',
        port: 13382
    }
});

clientRedis.on('error', err => console.log('Redis Client Error', err));


