import jwt from "jsonwebtoken";
import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

export const createUser = async (supabase: SupabaseClient, username: string, password: string, email?: string) => {
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert([
            { username: username, password: hashedPassword },
        ])
        .select()

    if (error) {
        console.error('Error creating user:', error);
        return null;
    }
    return data ? data[0] : null;
};

export const getUserByUsernameFromDb = async (supabase: SupabaseClient, username: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    return data;
};

export const changePassword = async (supabase: SupabaseClient, username: string, newPassword: string) => {
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('username', username);

    if (error) {
        console.error('Error changing password:', error);
        return false;
    }
    return true;
};

function generateToken(username: string,jwtSecret:string): string {
    return jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
}

export const loginUSer = async (supabase: SupabaseClient, username: string, password: string, jwtSecret: string) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('username, password')
            .eq('username', username)
            .single();
        if (error || !users || !bcrypt.compareSync(password, users.password)) {
            return null;
        }
        const token = generateToken(username, jwtSecret);
        console.log('users', users, 'error', error, 'password', password, 'username', username,token)
        return token;
    } catch (error) {
        console.error('Error authenticating user:', error);
        return null;
    }
};






