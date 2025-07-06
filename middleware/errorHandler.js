const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Unexpected field name for file upload. Use "file" as the field name.'
            });
        }
        return res.status(400).json({ error: err.message });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    // Email sending errors
    if (err.code === 'EENVELOPE' || err.code === 'ECONNREFUSED') {
        return res.status(500).json({ 
            error: 'Failed to send email notification. File was uploaded successfully.'
        });
    }

    // File system errors
    if (err.code === 'ENOENT') {
        return res.status(500).json({ 
            error: 'File system error. Please try again.'
        });
    }

    res.status(500).json({ error: 'Something went wrong! Please try again.' });
};

module.exports = errorHandler;
