import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import materialsRoutes from './routes/materials.js';
import productsRoutes from './routes/products.js';
import staffRoutes from './routes/staff.js';
import timeEntriesRoutes from './routes/timeentries.js';
import eventsRoutes from './routes/events.js';
import chatsRoutes from './routes/chats.js';
import notificationsRoutes from './routes/notifications.js';
import createKanbanRoutes from './routes/kanban.js';
import tasksRoutes from './routes/tasks.js';
import settingsRoutes from './routes/settings.js';
import createRequestsRoutes from './routes/requests.js';
import currencyRoutes from './routes/currency.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/promos2';

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith('http://localhost:')) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('kanban:join', ({ boardId }) => {
    if (!boardId) return;
    socket.join(`kanban:board:${boardId}`);
  });

  socket.on('kanban:leave', ({ boardId }) => {
    if (!boardId) return;
    socket.leave(`kanban:board:${boardId}`);
  });

  // Request management room
  socket.on('requests:join', () => {
    socket.join('requests:management');
  });

  socket.on('requests:leave', () => {
    socket.leave('requests:management');
  });
});

// CORS: tüm localhost origin'lerini kabul et (5173, 5175, 5177 vs.)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman vb.
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    return callback(new Error('Not allowed by CORS')); // ileride production domain eklenebilir
  },
  credentials: true,
}));

// Preflight için OPTIONS isteklerini hızlı döndür
app.options('*', cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/requests', createRequestsRoutes(io));
app.use('/api/materials', materialsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/timeentries', timeEntriesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/kanban', createKanbanRoutes(io));
app.use('/api', tasksRoutes);
app.use('/api/currency', currencyRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
