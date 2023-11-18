import bcrypt from 'bcrypt';
import {openDb} from "../db/database";
import {User} from "../Models/User";

export const createUser = async (username: string, password: string, email?: string): Promise<void> => {
    const db = await openDb();
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
};

// Import necessary modules and dependencies
async function getUserByUsernameFromDb(username: string): Promise<User | null> {
    try {
        const db = await openDb(); // Open the SQLite database
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        await db.close();
        return user || null;
    } catch (error) {
        throw new Error('Error fetching user from the database');
    }
}
// Function to change the user's password
// export async function changePassword(username: string, currentPassword: string, newPassword: string): Promise<boolean> {
//     try {
//         // Retrieve the user from the database
//         const user = await getUserByUsernameFromDb(username);
//
//         // Check if the user exists and the current password is correct
//         if (!user || !bcrypt.compareSync(currentPassword, user.hashedPassword)) {
//             return false; // Password change failed
//         }
//
//         // Hash and update the new password
//         const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
//         // Update the user's password in the database (replace with your database logic)
//         // Example: await updateUserPassword(username, hashedNewPassword);
//
//         return true; // Password change successful
//     } catch (error) {
//         throw new Error('Error changing password');
//     }
// }


// Function to change the user's password
export async function changePassword(username: string, newPassword: string): Promise<boolean> {
    try {
        // Hash the new password before storing it in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        const db = await openDb();
        await db.run('UPDATE users SET password = ? WHERE username = ?', hashedPassword, username);
        await db.close();

        return true; // Password updated successfully
    } catch (error) {
        throw new Error('Error changing password');
    }
}
