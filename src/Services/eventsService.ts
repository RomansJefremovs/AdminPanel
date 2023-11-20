// eventService.ts
import {AddEventBody, Event} from '../Models/Models';
import { openDb } from '../db/database';

// Function to add an event to the database
export async function addEvent(event: Event): Promise<number | undefined> {
    try {
const { title, description, price, image, eventDate } = event;
        const parsedDate = new Date(eventDate); // Converts the ISO string to a Date object
        const db = await openDb();
        const result = await db.run(
            'INSERT INTO events (title, description, price, image, date) VALUES (?, ?, ?, ?, ?)',
            [title, description, price, image, parsedDate]
        );
        await db.close();
        return result.lastID;
    } catch (error) {
        throw new Error('Error adding event to the database');
    }
}
