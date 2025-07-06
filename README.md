# Upload Section Backend

A Node.js backend service for handling file uploads and email notifications, deployed on Render.

## Frontend

The frontend application is deployed on GitHub Pages:
- URL: 

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

4. Add the following environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   MAIL_HOST=your-smtp-host
   MAIL_PORT=587
   MAIL_USER=your-smtp-username
   MAIL_PASS=your-smtp-password
   MAIL_FROM=your-sender-email
   FRONTEND_URL=
   MAX_FILE_SIZE=10485760
   ```

5. Deploy the service

## CORS Configuration

The backend is configured to accept requests only from the GitHub Pages frontend in production mode. This is handled through the CORS middleware in `server.js`.

## Important Notes for Render Deployment

1. File Storage:
   - Render's file system is ephemeral (temporary)
   - Files uploaded to the `/uploads` directory will be lost when the service restarts
   - For permanent storage, consider using cloud storage services like AWS S3

2. Environment Variables:
   - Configure all environment variables in Render dashboard
   - Never commit sensitive information to the repository

3. CORS:
   - Update FRONTEND_URL in Render environment variables to match your frontend domain
   - Example: https://your-frontend-app.com

4. Auto-Deploy:
   - Render automatically deploys when you push to the main/master branch
   - You can configure auto-deploy settings in the Render dashboard

## Features

- File upload (single and multiple files)
- Email sending
- CORS enabled
- Security headers
- Error handling
- Environment configuration

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your settings:
   - SMTP credentials for email
   - Frontend URL for CORS
   - Port number (default: 3000)
   - Other configurations

## Development

Run the development server:
```bash
npm run dev
```

## Production

Run the production server:
```bash
npm start
```

## API Endpoints

### File Upload

- Single file upload:
  ```
  POST /upload
  Content-Type: multipart/form-data
  Body: file
  ```

- Multiple files upload (max 5):
  ```
  POST /upload-multiple
  Content-Type: multipart/form-data
  Body: files
  ```

### Email

- Send email:
  ```
  POST /send-email
  Content-Type: application/json
  Body: {
    "to": "recipient@example.com",
    "subject": "Email Subject",
    "text": "Plain text content",
    "html": "<p>HTML content (optional)</p>"
  }
  ```

## Notes for Render Deployment

1. Set all environment variables in Render dashboard
2. Use a cloud storage service for production file storage
3. The uploads directory is ephemeral on Render's free tier

---

## Credits

Backend created by **Surya T S**. All rights reserved.

**Contributors:** Sooraj K R, Vrindha P
