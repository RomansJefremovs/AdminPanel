import {FastifyReply, FastifyRequest, HookHandlerDoneFunction} from "fastify";
import jwt, {Secret} from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export interface CustomFastifyRequest extends FastifyRequest {
    user?: { username: string }; // We make user property optional here
}

const jwtSecret: Secret = process.env.JWT_SECRET!;

if ( !jwtSecret) {
    console.error('secret incorrect.');
    process.exit(1); // Exit the process if variables are missing or incorrect.
}

// Middleware to verify JWT token
export function verifyToken(request: CustomFastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction): void {
    const authHeader: string | undefined = request.headers['authorization'];
    const token: string | undefined = authHeader && authHeader.split(' ')[1];

    if (!token) {
        reply.code(401).send({ message: 'Unauthorized' });
        return;
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            reply.code(403).send({ message: 'Token expired or invalid' });
            return;
        }
        request.user = user as { username: string }; // Assign the user object to request.user
        done();
    });
}