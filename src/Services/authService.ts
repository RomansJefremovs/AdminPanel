import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { openDb } from '../db/database';
import { User } from '../Models/User';

// Secret key for JWT
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

// Function to generate a JWT token
function generateToken(username: string): string {
    return jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
}

// Function to authenticate a user
export async function authenticateUser(username: string, password: string): Promise<string | null> {
    try {
        const db = await openDb(); // Open the SQLite database
        const user = await db.get<User>('SELECT * FROM users WHERE username = ?', username);

        if (!user || !bcrypt.compareSync(password, user.password)) {
            await db.close();
            return null; // Authentication failed
        }

        await db.close();

        // If authentication is successful, generate a JWT token
        const token = generateToken(username);
        return token;
    } catch (error) {
        throw new Error('Error authenticating user');
    }
}
