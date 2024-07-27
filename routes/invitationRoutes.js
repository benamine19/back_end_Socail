const express = require('express');
const { sendInvitation, acceptInvitation, rejectInvitation, getInvitations } = require('../controllers/invitationController');
const router = express.Router();
const {verifyToken} = require('../middleware/verifyToken');

router.post('/sendInvitation', verifyToken, sendInvitation);
router.post('/acceptInvitation/:id', verifyToken, acceptInvitation);
router.post('/rejectInvitation/:id', verifyToken, rejectInvitation);
router.get('/getInvitations', verifyToken, getInvitations);

module.exports = router;