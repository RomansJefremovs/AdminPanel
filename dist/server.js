"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const userService_1 = require("./Services/userService");
const verifyToken_1 = require("./Middleware/verifyToken");
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const uploadService_1 = __importDefault(require("./Services/uploadService"));
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = __importDefault(require("fs"));
const eventsService_1 = require("./Services/eventsService");
const wineService_1 = require("./Services/wineService");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const server = (0, fastify_1.default)({ logger: true });
// Use a helper function or direct process.env access
const env = {
    PORT: parseInt(process.env.PORT || '8080', 10),
};
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;
if (!supabaseUrl || !supabaseKey || !jwtSecret) {
    console.error('Supabase environmental variables are missing or incorrect.');
    process.exit(1); // Exit the process if variables are missing or incorrect.
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
server.register(fastify_multer_1.default.contentParser); // register multer content parser
const storage = fastify_multer_1.default.memoryStorage();
const upload = (0, fastify_multer_1.default)({ storage }); // configure multer with memory storage
const uploadService = new uploadService_1.default('Assets/Events');
server.get('/', async (request, reply) => {
    reply.send('pong');
});
server.post('/upload', { preHandler: upload.single('image') }, async (request, reply) => {
    const multerRequest = request;
    const file = multerRequest.file;
    if (!file) {
        reply.code(400).send({ message: 'No file uploaded' });
        return;
    }
    try {
        const savedFilePath = await uploadService.saveFile({
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
});
const uploadDirectory = path_1.default.join(__dirname, 'Assets/Events');
server.get('/get-image/:imageName', async (request, reply) => {
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
});
server.post('/register', async (request, reply) => {
    try {
        const { username, password, email } = request.body;
        console.log(username, password, email);
        const res = await (0, userService_1.createUser)(supabase, username, password, email);
        reply.send({ status: 'success', message: 'User registered successfully' + '' + res });
    }
    catch (error) {
        reply.code(500).send({ status: 'error', message: error });
    }
});
server.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    try {
        const token = await (0, userService_1.loginUSer)(supabase, username, password, jwtSecret);
        if (!token) {
            reply.code(401).send({ message: 'Authentication failed' });
        }
        else {
            reply.send({ token }); // Send the token in the response
        }
    }
    catch (error) {
        reply.code(500).send({ message: 'Internal server error' + ' ' + error });
    }
});
// Import necessary modules and dependencies
server.post('/edit-pswrd', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        // Get the user's username from the JWT token
        const username = request.user?.username; // Make sure to handle the case where user is undefined
        if (!username) {
            reply.code(401).send({ message: 'Unauthorized' });
            return;
        }
        // Get the new password from the request body
        const { newPassword } = request.body;
        const passwordChanged = await (0, userService_1.changePassword)(supabase, username, newPassword);
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
});
server.post('/add-event', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const { event, wines } = request.body;
        // const event = { title, description, price, image, eventDate, eventType }; // Create an event object
        const res = await (0, eventsService_1.addEvent)(supabase, event, wines);
        reply.send({ status: 'success', message: 'Event added' });
    }
    catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error registering event' }); // Corrected the error message
    }
});
server.get('/upcomingEvents', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const validEvents = await (0, eventsService_1.getEvents)(supabase);
        reply.send(validEvents);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/upcomingTastings', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const validEvents = await (0, eventsService_1.getTastings)(supabase);
        reply.send(validEvents);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/upcomingDish', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const validEvents = await (0, eventsService_1.getWeeklyDish)(supabase);
        reply.send(validEvents);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.delete('/deleteEvent/:eventId', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    const { eventId } = request.params;
    try {
        const response = (0, eventsService_1.deleteEvent)(supabase, eventId);
        reply.send(response);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error deleting event' });
    }
});
server.post('/add-wine', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const wine = request.body;
        const res = await (0, wineService_1.addWine)(supabase, wine);
        reply.send({ status: 'success', message: 'Wine added', res });
    }
    catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error adding wine' }); // Corrected the error message
    }
});
server.get('/get-wines', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const validWines = await (0, wineService_1.getWines)(supabase);
        reply.send(validWines);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching wines' });
    }
});
server.get('/get-wine/:name', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const { name } = request.params;
        const validWine = await (0, wineService_1.getWine)(supabase, name);
        reply.send(validWine);
    }
    catch (e) {
        throw new Error('Error getting wine from the database');
    }
});
server.get('/get-event-wines/:eventId', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const { eventId } = request.params;
        const validWines = await (0, wineService_1.getEventWines)(supabase, eventId);
        reply.send(validWines);
    }
    catch (e) {
        throw new Error('Error getting wine from the database');
    }
});
server.post('/add-event-wine', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const { eventId, wineId } = request.body;
        const res = await (0, wineService_1.addEventWine)(supabase, eventId, wineId);
        reply.send({ status: 'success', message: 'Event wine added' });
    }
    catch (e) {
        throw new Error('Error adding event wine to the database');
    }
});
server.delete('/delete-wine/:wineId', { preHandler: verifyToken_1.verifyToken }, async (request, reply) => {
    try {
        const { wineId } = request.params;
        const response = await (0, wineService_1.deleteWine)(supabase, wineId);
        reply.send(response);
    }
    catch (error) {
        throw new Error('Error deleting wine');
    }
});
server.listen({ port: env.PORT, host: '0.0.0.0' }, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    // You can also log that the server was started here (optional)
    console.log(`Server listening on port ${env.PORT}`);
});
// server.listen({ port: env.PORT}, err => {
//     if (err) {
//
//         // server.log.info(err);
//         process.exit(1);
//     }
//
//     const address = server.server.address();
//     const port = address && typeof address === 'object' ? address.port : 'unknown';
//     // server.log.info(`server listening on port ${port}`);
// });
exports.default = server;
