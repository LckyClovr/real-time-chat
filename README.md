# Comet Chat

A real-time collaborative chat application with file sharing and live document editing capabilities.

## Features

### Real-Time Messaging
- Instant message delivery via WebSocket connections
- Room-based chat architecture supporting multiple concurrent conversations
- Message persistence with PostgreSQL database
- User presence tracking

### File Sharing
- Upload and share files directly in chat
- Support for images (JPG, PNG, GIF, WEBP, SVG, BMP)
- Support for text files (TXT, MD, JSON, CSV, HTML, CSS, JS, TS, and more)
- Cloud storage via Cloudflare R2 (S3-compatible)
- Up to 50MB file uploads

### Collaborative Document Editing
- Real-time collaborative text editor
- Multiple users can edit the same document simultaneously
- Live editor presence indicators
- Automatic content synchronization across all connected editors
- Save documents directly to cloud storage

### Chat Commands
- `/8ball <question>` - Ask the Magic 8-ball
- `/gold <message>` - Send a message with gold text styling
- `/rainbow <message>` - Send a message with rainbow color animation
- `/name <nickname>` - Set a custom nickname

### User Management
- User registration and authentication
- Custom usernames and display names
- Profile image support
- JWT-based session management

## Tech Stack

### Frontend
- **Next.js 15** - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first styling
- **react-use-websocket** - WebSocket client

### Backend
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time bidirectional communication
- **Prisma** - ORM for database operations
- **PostgreSQL** - Primary database
- **Cloudflare R2** - Cloud file storage

### Security
- JWT authentication
- Argon2 password hashing
- Helmet security headers
- Zod schema validation
- Content filtering

## Project Structure

```
RTCApp/
├── real-time-chat/          # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── chat/        # Chat UI and components
│       │   └── _components/ # Shared components
│       ├── hooks/           # Custom React hooks
│       └── ts/
│           ├── api/         # API client and types
│           └── utils/       # Utility functions
│
└── real-time-chat-api/      # Express backend
    └── src/
        ├── routes/          # REST API endpoints
        ├── websocket/       # WebSocket server
        ├── middlewares/     # Express middlewares
        └── resources/       # Database and S3 clients
```


## License

MIT
