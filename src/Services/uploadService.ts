import fs from 'fs';
import path from 'path';

interface UploadedFile {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
}

class UploadService {
    private storagePath: string;

    constructor(storagePath: string) {
        this.storagePath = storagePath;
    }

    async saveFile(file: UploadedFile): Promise<string> {
        const filePath = path.join(this.storagePath, file.originalname);

        // Save the file to disk
        await fs.promises.writeFile(filePath, file.buffer);

        return filePath; // Returning the path where the file was saved
    }
}

export default UploadService;
