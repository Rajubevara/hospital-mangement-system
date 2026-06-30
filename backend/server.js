import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import { handleSocketConnections } from './socket/socketHandler.js';

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // For development flexibility
    methods: ['GET', 'POST'],
  },
});

// Configure Socket event handling
handleSocketConnections(io);

// Listen on Port
server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
