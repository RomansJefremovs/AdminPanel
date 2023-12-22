"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUSer = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = async (supabase, username, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert([
        { username: username, password: hashedPassword },
    ])
        .select();
    if (error) {
        return null;
    }
    return data ? data[0] : null;
};
exports.createUser = createUser;
function generateToken(username, jwtSecret) {
    return jsonwebtoken_1.default.sign({ username }, jwtSecret, { expiresIn: '1h' });
}
const loginUSer = async (supabase, username, password, jwtSecret) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('username, password')
            .eq('username', username)
            .single();
        if (error || !users || !bcrypt_1.default.compareSync(password, users.password)) {
            return null;
        }
        const token = generateToken(username, jwtSecret);
        return token;
    }
    catch (error) {
        return null;
    }
};
exports.loginUSer = loginUSer;
