"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const init_1 = require("./db/init");
const database_1 = require("./db/database");
const userService_1 = require("./Services/userService");
const authService_1 = require("./Services/authService");
const verifyToken_1 = require("./Middleware/verifyToken");
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const uploadService_1 = __importDefault(require("./Services/uploadService"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const eventsService_1 = require("./Services/eventsService");
// import {addEvent} from "./Services/eventsService";
const fastifyStatic = require('fastify-static');
const jwt = require('jsonwebtoken');
const server = (0, fastify_1.default)({ logger: true });
(0, init_1.initializeDatabase)();
server.register(fastify_multer_1.default.contentParser); // register multer content parser
// Serve static files from the '123' directory
server.register(fastifyStatic, {
    root: path_1.default.join(__dirname, 'public'),
});
const storage = fastify_multer_1.default.memoryStorage();
const upload = (0, fastify_multer_1.default)({ storage }); // configure multer with memory storage
const uploadService = new uploadService_1.default('Assets/Events');
server.post('/upload', { preHandler: upload.single('image') }, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const multerRequest = request;
    const file = multerRequest.file;
    if (!file) {
        reply.code(400).send({ message: 'No file uploaded' });
        return;
    }
    try {
        const savedFilePath = yield uploadService.saveFile({
            originalname: file.originalname,
            mimetype: file.mimetype,
            buffer: file.buffer
        });
        reply.send({ message: 'File uploaded successfully', path: savedFilePath });
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Failed to save the file' });
    }
}));
const uploadDirectory = path_1.default.join(__dirname, 'Assets/Events');
server.get('/get-image/:imageName', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageName } = request.params;
    // Construct the full file path
    const filePath = path_1.default.join(uploadDirectory, imageName);
    // Check if the file exists
    if (fs_1.default.existsSync(filePath)) {
        // Stream the file back
        reply.type('image/jpeg'); // Set the correct MIME type based on your images
        return fs_1.default.createReadStream(filePath);
    }
    else {
        // If the file does not exist, send an appropriate response
        reply.code(404).send({ message: 'Image not found' });
    }
}));
server.post('/register', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email } = request.body;
        yield (0, userService_1.createUser)(username, password, email);
        reply.send({ status: 'success', message: 'User registered successfully' });
    }
    catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error registering user' });
    }
}));
server.post('/login', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = request.body;
    try {
        const token = yield (0, authService_1.authenticateUser)(username, password);
        if (!token) {
            reply.code(401).send({ message: 'Authentication failed' });
        }
        else {
            reply.send({ token }); // Send the token in the response
        }
    }
    catch (error) {
        reply.code(500).send({ message: 'Internal server error' });
    }
}));
// Import necessary modules and dependencies
server.post('/edit-pswrd', { preHandler: verifyToken_1.verifyToken }, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get the user's username from the JWT token
        const username = (_a = request.user) === null || _a === void 0 ? void 0 : _a.username; // Make sure to handle the case where user is undefined
        if (!username) {
            reply.code(401).send({ message: 'Unauthorized' });
            return;
        }
        // Get the new password from the request body
        const { newPassword } = request.body;
        const passwordChanged = yield (0, userService_1.changePassword)(username, newPassword);
        if (passwordChanged) {
            reply.send({ message: 'Password updated successfully' });
        }
        else {
            reply.code(500).send({ message: 'Error updating password' });
        }
    }
    catch (error) {
        // Handle any errors that occur during the password update process
        reply.code(500).send({ message: 'Error updating password' });
    }
}));
server.post('/add-event', { preHandler: verifyToken_1.verifyToken }, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { description, image, price, title, eventDate } = request.body;
        const event = { title, description, price, image, eventDate }; // Create an event object
        const res = yield (0, eventsService_1.addEvent)(event);
        reply.send({ status: 'success', message: 'Event added' });
    }
    catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error registering event' }); // Corrected the error message
    }
}));
server.get('/upcomingEvents', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, database_1.openDb)();
        const currentTimestamp = Date.now(); // Current Unix timestamp in milliseconds
        const events = yield db.all('SELECT * FROM events WHERE date > ? ORDER BY date ASC', currentTimestamp);
        yield db.close();
        const validEvents = events
            .filter(event => {
            const eventDate = parseInt(event.date);
            // Filter out events that have invalid dates
            return !isNaN(eventDate) && eventDate > currentTimestamp;
        })
            .map(event => (Object.assign(Object.assign({}, event), { 
            // Convert stored timestamps back to ISO strings
            date: new Date(parseInt(event.date)).toISOString() })));
        reply.send(validEvents);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
}));
server.listen(3000, err => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    const address = server.server.address();
    const port = address && typeof address === 'object' ? address.port : 'unknown';
    server.log.info(`server listening on port ${port}`);
});
exports.default = server;
