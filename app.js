const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Importer http
const { Server } = require('socket.io'); // Importer socket.io

dotenv.config();
// Connect to database
connectDB();

const app = express();
const server = http.createServer(app); // Créer un serveur HTTP
const io = new Server(server, {
  cors: {
    origin: '*', // Autoriser toutes les origines
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(bodyParser.json({ limit: '100mb' })); // Augmenter la limite de taille pour les requêtes JSON
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); // Augmenter la limite de taille pour les requêtes URL-encoded
app.use(cors());

// Pour afficher les photos par le lien localhost:5000
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/user', require('./routes/userRoutes'));
app.use('/post', require('./routes/postRoutes'));
app.use('/comment', require('./routes/commentRoutes'));
app.use('/like', require('./routes/likeRoutes'));
app.use('/friend', require('./routes/friendRoutes'));
app.use('/message', require('./routes/messageRoutes'));
app.use('/notification', require('./routes/notificationRoutes'));

// Socket.io logic

let onlineUsers=[]

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)
 
// Ajouter un nouvel utilisateur
    socket.on('addNewUser', (userId) => {
      if (!onlineUsers.some(user => user.userId === userId)) {
        onlineUsers.push({ userId, socketId: socket.id });
      }
      console.log('onlineUsers', onlineUsers);
      io.emit("getonlineUsers", onlineUsers);
    });

// Gérer les messages entrants
  socket.on('addMessage', (Message) => {
    const user = onlineUsers.find(user => user.userId === Message.reciver);
    if (user) {
      console.log('Message 9bal', Message)
      io.to(user.socketId).emit('getMessage', Message);
      console.log('ba3d', Message)
    }
  });

// Déconnexion de l'utilisateur
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
    io.emit("getonlineUsers", onlineUsers);
    console.log('onlineUsers:', onlineUsers);
    console.log('A user disconnected:', socket.id);
  });
});


// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
