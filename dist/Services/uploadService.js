"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UploadService {
    storagePath;
    constructor(storagePath) {
        this.storagePath = storagePath;
    }
    async saveFile(file) {
        const filePath = path_1.default.join(this.storagePath, file.originalname);
        // Save the file to disk
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        return filePath; // Returning the path where the file was saved
    }
}
exports.default = UploadService;
