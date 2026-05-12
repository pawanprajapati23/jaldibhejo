import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // Allow requests from the specific frontend URL
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Room management
// Maps roomID to an array of socket IDs
const rooms: Record<string, string[]> = {};

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-room', (roomId: string) => {
    if (rooms[roomId]) {
      socket.emit('error', 'Room already exists');
      return;
    }
    rooms[roomId] = [socket.id];
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  socket.on('join-room', (roomId: string) => {
    if (!rooms[roomId]) {
      socket.emit('error', 'Room not found');
      return;
    }
    
    if (rooms[roomId].length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    rooms[roomId].push(socket.id);
    socket.join(roomId);
    socket.emit('room-joined', roomId);
    
    // Notify the other user (the creator) that someone joined
    socket.to(roomId).emit('peer-joined', socket.id);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Relay WebRTC signaling data
  socket.on('signal', (data: { roomId: string, signalData: any }) => {
    console.log(`[SIGNAL] from ${socket.id} in room ${data.roomId}: type = ${data.signalData.type || (data.signalData.candidate ? 'ice-candidate' : 'unknown')}`);
    // Send to everyone in the room except the sender
    socket.to(data.roomId).emit('signal', {
      senderId: socket.id,
      signalData: data.signalData,
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from any rooms
    for (const roomId in rooms) {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
        
        // Notify remaining peer if any
        socket.to(roomId).emit('peer-left', socket.id);

        // Clean up empty rooms
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
          console.log(`Room deleted: ${roomId}`);
        }
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('JaldiBhejo Signaling Server is running.');
});

server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});
