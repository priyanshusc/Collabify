// Backend/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // 👈 Import auth routes
const noteRoutes = require('./routes/noteRoutes');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // 👈 Add this middleware to parse JSON bodies

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Backend Server is Running!</h1>');
});

// Use the auth routes 👈
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes); 

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});