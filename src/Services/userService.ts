import jwt from "jsonwebtoken";
import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

export const createUser = async (supabase: SupabaseClient, username: string, password: string) => {
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert([
            { username: username, password: hashedPassword },
        ])
        .select()

    if (error) {
        return null;
    }
    return data ? data[0] : null;
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
        return token;
    } catch (error) {
        return null;
    }
};






