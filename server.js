require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sendMail } = require('./utils/mailer');
const upload = require('./middleware/upload');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers to protect against common web vulnerabilities
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// CORS configuration for production
// In production, only allow requests from your GitHub Pages domain
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL  // Use the GitHub Pages URL in production
        : '*',                      // Allow all origins in development
    methods: ['GET', 'POST'],       // Only allow GET and POST methods
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use(express.json());
// Increase payload limit for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// File upload endpoint with email notification
app.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }
        
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        // Send notification only to the owner with file attachment
        await sendMail({
            to: process.env.OWNER_EMAIL,
            subject: 'New Upload - Luz&Lens',
            text: `New file uploaded:\n\nUploader: ${name} (${email})\nFile: ${req.file.originalname}\nSize: ${(req.file.size / 1024).toFixed(2)} KB\nType: ${req.file.mimetype}\n\nBest regards,\nLuz&Lens Upload Service`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2 style="color: #2c3e50;">New Upload - Luz&Lens</h2>
                    <p>A new file has been uploaded to your system.</p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                        <h3 style="color: #34495e;">Uploader Details:</h3>
                        <ul style="list-style: none; padding-left: 0;">
                            <li>📧 <strong>Name:</strong> ${name}</li>
                            <li>✉️ <strong>Email:</strong> ${email}</li>
                        </ul>
                        <h3 style="color: #34495e;">File Details:</h3>
                        <ul style="list-style: none; padding-left: 0;">
                            <li>📎 <strong>Filename:</strong> ${req.file.originalname}</li>
                            <li>📊 <strong>Size:</strong> ${(req.file.size / 1024).toFixed(2)} KB</li>
                            <li>📁 <strong>Type:</strong> ${req.file.mimetype}</li>
                        </ul>
                    </div>
                    <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px;">
                        Best regards,<br>
                        <strong>Luz&Lens Upload Service</strong>
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: req.file.originalname,
                    path: req.file.path
                }
            ]
        });

        // File uploaded successfully
        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: `/uploads/${req.file.filename}`,
                size: req.file.size
            },
            email: {
                to: email,
                status: 'sent'
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        if (error.code === 'ENOENT') {
            return res.status(500).json({ error: 'File upload failed' });
        }
        next(error);
    }
});

// Multiple files upload endpoint
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Please upload at least one file' });
        }

        // Files uploaded successfully
        res.json({
            message: 'Files uploaded successfully',
            files: req.files.map(file => ({
                filename: file.filename,
                path: `/uploads/${file.filename}`,
                size: file.size
            }))
        });
    } catch (error) {
        next(error);
    }
});

// Email endpoint
app.post('/send-email', async (req, res, next) => {
    const { to, subject, text, html } = req.body;
    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const info = await sendMail({ to, subject, text, html });
        res.json({ message: 'Email sent', messageId: info.messageId });
    } catch (error) {
        next(error);
    }
});

app.get('/', (req, res) => {
    res.send('Backend is running');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
