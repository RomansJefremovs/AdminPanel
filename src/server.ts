import {FastifyRequest} from 'fastify';
import { initializeDatabase } from './db/init';
import {openDb} from "./db/database";
import {changePassword, createUser} from "./Services/userService";
import {User} from "./Models/User";
import {Event} from "./Models/Models";
import {authenticateUser} from "./Services/authService";
import {CustomFastifyRequest, verifyToken} from "./Middleware/verifyToken";
import multer from 'fastify-multer';
import {Request} from "express";
import UploadService from "./Services/uploadService";
import path from "path";
import fs from "fs";
import { addEvent } from './Services/eventsService';

import fastify from 'fastify';

const server = fastify({ logger: true });

const fastifyStatic = require('fastify-static');

interface MulterRequest extends FastifyRequest {
    file: Request['file']; // Use the 'file' type from Express Request
}
const jwt = require('jsonwebtoken');


initializeDatabase();

server.register(multer.contentParser); // register multer content parser
// Serve static files from the '123' directory
server.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
});

const storage = multer.memoryStorage();
const upload = multer({ storage }); // configure multer with memory storage

const uploadService = new UploadService('Assets/Events');

server.post('/upload', { preHandler: upload.single('image') }, async (request, reply) => {
    const multerRequest = request as unknown as { file: Express.Multer.File };
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
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Failed to save the file' });
    }
});
interface GetImageParams {
    imageName: string;
}
const uploadDirectory = path.join(__dirname, 'Assets/Events');

server.get<{
    Params: GetImageParams;
}>('/get-image/:imageName', async (request, reply) => {
    const { imageName } = request.params;

    // Construct the full file path
    const filePath = path.join(uploadDirectory, imageName);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Stream the file back
        reply.type('image/jpeg'); // Set the correct MIME type based on your images
        return fs.createReadStream(filePath);
    } else {
        // If the file does not exist, send an appropriate response
        reply.code(404).send({ message: 'Image not found' });
    }
});


server.post<{ Body: User }>('/register', async (request, reply) => {
    try {
        const { username, password, email } = request.body;
        await createUser(username, password, email);
        reply.send({ status: 'success', message: 'User registered successfully' });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error registering user' });
    }
});
interface LoginBody {
    username: string;
    password: string;
}

server.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { username, password } = request.body;

    try {
        const token = await authenticateUser(username, password);

        if (!token) {
            reply.code(401).send({ message: 'Authentication failed' });
        } else {
            reply.send({ token }); // Send the token in the response
        }
    } catch (error) {
        reply.code(500).send({ message: 'Internal server error' });
    }
});

// Import necessary modules and dependencies

server.post<{ Body: { newPassword: string } }>('/edit-pswrd', { preHandler: verifyToken }, async (request: CustomFastifyRequest, reply) => {
    try {
        // Get the user's username from the JWT token
        const username = request.user?.username; // Make sure to handle the case where user is undefined

        if (!username) {
            reply.code(401).send({ message: 'Unauthorized' });
            return;
        }

        // Get the new password from the request body
        const { newPassword } = request.body as { newPassword: string };
        const passwordChanged = await changePassword(username, newPassword);

        if (passwordChanged) {
            reply.send({ message: 'Password updated successfully' });
        } else {
            reply.code(500).send({ message: 'Error updating password' });
        }
    } catch (error) {
        // Handle any errors that occur during the password update process
        reply.code(500).send({ message: 'Error updating password' });
    }
});


server.post<{ Body: Event }>('/add-event', { preHandler: verifyToken }, async (request, reply) => {
    try {
        const { description, image, price, title, eventDate } = request.body;
        const event = { title, description, price, image, eventDate }; // Create an event object
        const res = await addEvent(event);
        reply.send({ status: 'success', message: 'Event added' });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error registering event' }); // Corrected the error message
    }
});


server.get('/upcomingEvents', async (request, reply) => {
    try {
        const db = await openDb();
        const currentTimestamp = Date.now(); // Current Unix timestamp in milliseconds

        const events = await db.all(
            'SELECT * FROM events WHERE date > ? ORDER BY date ASC',
            currentTimestamp
        );

        await db.close();

        const validEvents = events
            .filter(event => {
                const eventDate = parseInt(event.date);
                // Filter out events that have invalid dates
                return !isNaN(eventDate) && eventDate > currentTimestamp;
            })
            .map(event => ({
                ...event,
                // Convert stored timestamps back to ISO strings
                date: new Date(parseInt(event.date)).toISOString()
            }));

        reply.send(validEvents);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});




server.listen(3000, err => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }

    const address = server.server.address();
    const port = address && typeof address === 'object' ? address.port : 'unknown';
    server.log.info(`server listening on port ${port}`);
});



export default server;