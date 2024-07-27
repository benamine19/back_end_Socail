const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const {verifyToken} = require('../middlewares/verifyToken');

// Route pour envoyer un message
router.post('/send', verifyToken, sendMessage);
// Route pour récupérer les messages entre deux utilisateurs
router.get('/getMessages/:friendId', verifyToken, getMessages);

module.exports = router;
