"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error('secret incorrect.');
    process.exit(1); // Exit the process if variables are missing or incorrect.
}
// Middleware to verify JWT token
function verifyToken(request, reply, done) {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        reply.code(401).send({ message: 'Unauthorized' });
        return;
    }
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, user) => {
        if (err) {
            reply.code(403).send({ message: 'Token expired or invalid' });
            return;
        }
        request.user = user; // Assign the user object to request.user
        done();
    });
}
exports.verifyToken = verifyToken;
