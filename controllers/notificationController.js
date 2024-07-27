const {Notification} = require('../models/notificationModels');

// Obtenir les notifications et le nombre de notifications non lues
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Obtenir les notifications de l'utilisateur, triées par date de création
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    // Compter les notifications non lues
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    // Répondre avec les notifications et le nombre de non lues
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  const markAsRead = async (req, res) => {
    try {
      const { notificationId } = req.body;
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const markAllAsRead = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Mettre à jour toutes les notifications non lues de l'utilisateur
      await Notification.updateMany({ user: userId, read: false }, { read: true });
  
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
module.exports = { getNotifications, markAsRead ,markAllAsRead};

