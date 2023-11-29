// src/@types/fastify/index.d.ts
import { FastifyInstance } from 'fastify';
import { Logger } from 'pino';

declare module 'fastify' {
    interface FastifyInstance {
        log: Logger;
    }
}
