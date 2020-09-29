import path from 'path';
import multer, { StorageEngine } from 'multer';
import crypto from 'crypto';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

interface IUploadConfig {
    driver: 's3' | 'disk';

    tmpFolder: string;
    uploadsFolder: string;

    multer: {
        storage: StorageEngine;
    }

    config: {
        disk: {};
        aws: {
            bucket: string;
        }
    }
}

export default {
    driver: 'disk',

    tmpFolder,
    uploadsFolder: path.resolve(tmpFolder, 'uploads'),

    multer: {
        storage: multer.diskStorage({
            destination: tmpFolder,
            filename (request, file, callback) {
                const fileHash = crypto.randomBytes(10).toString("hex");
                const fileName = `${fileHash}-${file.originalname}`;

                return callback(null, fileName);
        },
    }),
    },

    config: {
        disk: {},
        aws: {
            bucket: 'app-gobarber-22'
        }
    }
} as IUploadConfig;
