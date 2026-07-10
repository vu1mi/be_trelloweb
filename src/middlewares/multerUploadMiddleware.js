import multer from 'multer';
import {MAX_SIZE, ALLOWED_TYPES} from '~/utils/validators.js';


const customfilefilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.'), false);
    }
};

const upload = multer({
    limits: { fileSize: MAX_SIZE },
    fileFilter: customfilefilter,
});

export const multeruploadMiddleware = {upload}