const express = require('express');
const { getNotifications, markAsRead ,markAllAsRead} = require('../controllers/notificationController');
const router = express.Router();
const {verifyToken} = require('../middlewares/verifyToken');


router.get('/getNotifications',verifyToken, getNotifications);
router.post('/markAsRead',verifyToken, markAsRead);
router.post('/markAllAsRead',verifyToken, markAllAsRead);


module.exports = router;