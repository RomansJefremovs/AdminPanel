// api/login.ts
import { loginUSer } from '../src/services/userService';
import { createClient } from "@supabase/supabase-js";
import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req:VercelRequest, res:VercelResponse) => {
    const { username, password, email } = req.body;

    try {
        await loginUSer(supabase, username, password, email);
        res.send({ status: 'success', message: 'User registered successfully' });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
};
