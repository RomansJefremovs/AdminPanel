// serverless.js (the entry point for your Vercel serverless function)

"use strict";

import * as dotenv from "dotenv";
dotenv.config();
const fastifyStatic = require('fastify-static');
import fastifyApp from "../src/server"; // adjust the path as necessary to where your server.ts is located

export default async (req, res) => {
    await fastifyApp.ready();
    fastifyApp.server.emit('request', req, res);
};
