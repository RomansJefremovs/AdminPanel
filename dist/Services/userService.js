"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUSer = exports.changePassword = exports.getUserByUsernameFromDb = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = async (supabase, username, password, email) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert([
        { username: username, password: hashedPassword },
    ])
        .select();
    if (error) {
        console.error('Error creating user:', error);
        return null;
    }
    return data ? data[0] : null;
};
exports.createUser = createUser;
const getUserByUsernameFromDb = async (supabase, username) => {
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
exports.getUserByUsernameFromDb = getUserByUsernameFromDb;
const changePassword = async (supabase, username, newPassword) => {
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
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
exports.changePassword = changePassword;
function generateToken(username, jwtSecret) {
    return jsonwebtoken_1.default.sign({ username }, jwtSecret, { expiresIn: '1h' });
}
const loginUSer = async (supabase, username, password, jwtSecret) => {
    try {
        // Query the Supabase table for the user
        const { data: users, error } = await supabase
            .from('users')
            .select('username, password')
            .eq('username', username)
            .single();
        if (error || !users || !bcrypt_1.default.compareSync(password, users.password)) {
            return null; // Authentication failed
        }
        const token = generateToken(username, jwtSecret);
        // If authentication is successful, generate a JWT token
        console.log('users', users, 'error', error, 'password', password, 'username', username, token);
        return token;
    }
    catch (error) {
        console.error('Error authenticating user:', error);
        return null;
    }
};
exports.loginUSer = loginUSer;
