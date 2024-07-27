const {Message} = require('../models/messageModels');
const {Friendship} = require('../models/friendshipModels');
const {Notification} = require('../models/notificationModels');
const { User } = require('../models/userModel');
// Envoyer un message
const sendMessage = async (req, res) => {
    console.log('Notification ::: ', Notification)
    const { receiverId, content } = req.body;
    const senderId = req.user._id;
    try {
        // Vérifier si les utilisateurs sont amis
        const friendship = await Friendship.findOne({
            $or: [
                { user1: senderId, user2: receiverId },
                { user1: receiverId, user2: senderId }
            ]
        });

        if (!friendship) {
            return res.status(403).json({ message: "Vous ne pouvez envoyer des messages qu'à vos amis." });
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content
        });
        const savedMessage = await message.save();
        // Générer une notification
        const senderUser = await User.findById(senderId); // Assurez-vous d'avoir ce modèle
        
        const notification = new Notification({
        user: receiverId,
        type: 'message',
        content: `Vous avez reçu un message de ${senderUser.username}`
        });
        await notification.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer les messages entre deux utilisateurs
const getMessages = async (req, res) => {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.user._id;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message non trouvé." });
        }

        if (message.sender.toString() !== userId.toString() && message.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce message." });
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: "Message supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    deleteMessage
};
