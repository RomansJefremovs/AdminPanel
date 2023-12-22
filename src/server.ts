import {createClient, SupabaseClient} from "@supabase/supabase-js";
import {loginUSer, changePassword, createUser} from "./Services/userService";
import {User} from "./Models/User";
import {Event, Wine} from "./Models/Models";
import {CustomFastifyRequest, verifyToken} from "./Middleware/verifyToken";
import multer from 'fastify-multer';
import UploadService from "./Services/uploadService";
import dotenv from 'dotenv';
import fastify from 'fastify';
import fs from "fs";
import {
    addEvent,
    deleteEvent,
    getAllEvents, getAllTastings,
    getEvents,
    getTastings,
    getWeeklyDish, getWeeklyWine,
    geUpcomingtWeeklyDish
} from "./Services/eventsService";
import {
    addEventWine,
    addWine,
    addWines,
    deleteWine,
    getEventWines,
    getWine,
    getWines,
    getWinesByEvent
} from "./Services/wineService";
import path from "path";
dotenv.config();
const server = fastify({ logger: true });
interface Environment {
    PORT: number;
}

const env: Environment = {
    PORT: parseInt(process.env.PORT || '8080', 10),
};

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;
if (!supabaseUrl || !supabaseKey || !jwtSecret) {
    console.error('Supabase environmental variables are missing or incorrect.');
    process.exit(1);
}
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
server.register(multer.contentParser);
server.addHook('onRequest', (request, reply, done) => {
    reply
        .header('Access-Control-Allow-Origin', '*') // or specify your frontend domain
        .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type, Authorization') // Include Authorization
        .header('Access-Control-Allow-Credentials', true);
    done();
});

server.options('*', (request, reply) => {
    reply
        .header('Access-Control-Allow-Origin', '*') // or specify your frontend domain
        .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type, Authorization') // Include Authorization
        .header('Access-Control-Allow-Credentials', true)
        .send();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadService = new UploadService('Assets/Events');
server.get('/', async (request, reply) => {
reply.send('pong');
})
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
    const filePath = path.join(uploadDirectory, imageName);
    if (fs.existsSync(filePath)) {
        reply.type('image/jpeg');
        return fs.createReadStream(filePath);
    } else {
        reply.code(404).send({ message: 'Image not found' });
    }
});


server.post<{ Body: User }>('/register', async (request, reply) => {
    try {
        const { username, password, email } = request.body;
        console.log(username, password, email)
        const res = await createUser(supabase,username, password, email);
        reply.send({ status: 'success', message: 'User registered successfully' + '' + res });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error });
    }
});
interface LoginBody {
    username: string;
    password: string;
}

server.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { username, password } = request.body;

    try {
        const token = await loginUSer(supabase,username, password, jwtSecret);

        if (!token) {
            reply.code(401).send({ message: 'Authentication failed' });
        } else {
            reply.send({ token });
        }
    } catch (error) {
        reply.code(500).send({ message: 'Internal server error' + ' ' + error });
    }
});

// Import necessary modules and dependencies

server.post<{ Body: { newPassword: string } }>('/edit-pswrd', { preHandler: verifyToken }, async (request: CustomFastifyRequest, reply) => {
    try {
        const username = request.user?.username;

        if (!username) {
            reply.code(401).send({ message: 'Unauthorized' });
            return;
        }
        const { newPassword } = request.body as { newPassword: string };
        const passwordChanged = await changePassword(supabase,username, newPassword);

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


server.post<{ Body: {
    event: Event;
    }
}>('/add-event',
    { preHandler: verifyToken },
    async (request, reply) => {
    try {
        const { event} = request.body;
        const res = await addEvent(supabase,event);
        if (typeof res === 'number') {
            reply.code(500).send({ status: 'error', message: 'Error registering event' });
        } else {
            reply.code(200).send(res[0]);
        }
    } catch (error) {
        reply.code(500).send({ status: 'error', message: 'Error registering event' });
    }
});
server.get('/allEvents',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await getAllEvents(supabase);
        reply.send(validEvents);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/upcomingEvents',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await getEvents(supabase);
        reply.send(validEvents);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/upcomingTastings',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await getTastings(supabase);
        reply.send(validEvents);

    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/allTastings',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await getAllTastings(supabase);
        reply.send(validEvents);

    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/upcomingDish',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await geUpcomingtWeeklyDish(supabase);
        reply.send(validEvents);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/allWeeklyDish',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await getWeeklyDish(supabase);
        reply.send(validEvents);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});
server.get('/allWeeklyWine',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validEvents = await getWeeklyWine(supabase);
        reply.send(validEvents);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching upcoming events' });
    }
});

server.delete<{Params:{
    eventId: number;
    }}>('/deleteEvent/:eventId',{ preHandler: verifyToken }, async (request, reply) => {
    const { eventId } = request.params;

    try {
        const response = deleteEvent(supabase,eventId);
        reply.send(response);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error deleting event' });
    }
});

server.post<{ Body: Wine }>('/add-wine', { preHandler: verifyToken }, async (request, reply) => {
    try {
        const wine = request.body;
        const res = await addWine(supabase,wine);
        reply.send({ status: 'success', message: 'Wine added', res });
    } catch (error) {
        reply.code(500).send({ status: 'error', message:'error' }); // Corrected the error message
    }
});
server.post<{ Body: Wine[] }>('/add-wines', { preHandler: verifyToken }, async (request, reply) => {
    try {
        const wine = request.body;
        const res = await addWines(supabase,wine);
        reply.send({ status: 'success', message: 'Wines added', res });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error}); // Corrected the error message
    }
});

server.get('/get-wines',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const validWines = await getWines(supabase);
        reply.send(validWines);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching wines' });
    }
});
server.get<{ Params: { eventId: number } }>('/get-wines-event/:eventId', { preHandler: verifyToken }, async (request, reply) => {
    try {
        const { eventId } = request.params;
        const validWines = await getWinesByEvent(supabase, eventId);
        reply.send(validWines);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Error fetching wines' });
    }
});

server.get<{Params:{
    name: string;
    }}>('/get-wine/:name',  { preHandler: verifyToken }, async (request, reply) => {
   try {
         const { name } = request.params;
         const validWine = await getWine(supabase, name);
         reply.send(validWine);
   }catch (e) {
       throw new Error('Error getting wine from the database');
   }
});

server.get<{Params:{
    eventId: number;
    }}>('/get-event-wines/:eventId',  { preHandler: verifyToken }, async (request, reply) => {
    try {
        const { eventId } = request.params;
        const validWines = await getEventWines(supabase, eventId);
        reply.send(validWines);
    }catch (e) {
        throw new Error('Error getting wine from the database');
    }
});

server.post<{Body:{
    eventId: number;
    wineId: number;
    }}>('/add-event-wine', { preHandler: verifyToken }, async (request, reply) => {
   try {
         const { eventId, wineId } = request.body;
         const res = await addEventWine(supabase,eventId, wineId);
         reply.send({ status: 'success', message: 'Event wine added' });
   }catch (e) {
         throw new Error('Error adding event wine to the database');
   }
});

server.delete<{Params:{
    wineId: number;
    }}>('/delete-wine/:wineId', { preHandler: verifyToken }, async (request, reply) => {
    try {
        const { wineId } = request.params;
        const response = await deleteWine(supabase,wineId);
        reply.send(response);
    } catch (error) {
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
// server.listen({ port: env.PORT,host:'127.0.0.1'}, err => {
//     if (err) {
//
//         server.log.info(err);
//         process.exit(1);
//     }
//     const address = server.server.address();
//     const port = address && typeof address === 'object' ? address.port : 'unknown';
//     server.log.info(`server listening on port ${port}`);
// });



export default server;


