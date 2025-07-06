const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Accept only image formats
    if (!file.mimetype.startsWith('image/')) {
        req.fileValidationError = 'Only image files are allowed (jpg, jpeg, png, gif)';
        return cb(new Error('Only image files are allowed'), false);
    }

    // Check specific image extensions
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
        cb(null, true);
    } else {
        req.fileValidationError = 'Only .jpg, .jpeg, .png, and .gif files are allowed';
        cb(new Error('Invalid image format'), false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    }
});

module.exports = upload;
