import fs from 'fs'
import path from 'path'

import { logger } from './Logger'

export class FileCache {
    static directoryPath = path.join(process.cwd(), '.cache');

    static logger = logger.use({
        prefix: ({ yellow }) => yellow('[CACHE]')
    });

    static ensureCacheDirectory() {
        fs.mkdirSync(this.directoryPath, {
            recursive: true
        });
    }

    static resolvePath(key: string) {
        return path.join(this.directoryPath, `${key}.json`);
    }

    static write<T>(key: string, data: T) {
        this.ensureCacheDirectory();

        const filePath = this.resolvePath(key);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');

        return data;
    }

    static read<T>(key: string) {
        this.ensureCacheDirectory();

        const filePath = this.resolvePath(key);
        if (!fs.existsSync(filePath)) {
            return null;
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
        } catch (err) {
            this.logger.error(`Failed to parse cache "${key}":`);

            return null;
        }
    }

    static exists(key: string) {
        return fs.existsSync(this.resolvePath(key));
    }

    static remove(key: string) {
        this.ensureCacheDirectory();

        const filePath = this.resolvePath(key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    static clear() {
        this.ensureCacheDirectory();

        const files = fs.readdirSync(this.directoryPath);
        for (const file of files) {
            fs.unlinkSync(path.join(this.directoryPath, file));
        }
    }
}

export default FileCache;