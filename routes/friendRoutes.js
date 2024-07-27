const express = require('express');
const { searchUser,getInvitationsforsender,getFriends,getNonFriends,getAllFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendsPosts, getInvitations,} = require('../controllers/friendController');
const router = express.Router();
const {verifyToken} = require('../middlewares/verifyToken');

router.post('/sendFriendRequest', verifyToken, sendFriendRequest);
router.get('/getFriends', verifyToken, getFriends);
router.get('/getNonFriends', verifyToken, getNonFriends);
router.get('/searchUser', verifyToken, searchUser);
router.get('/getAllFriends', getAllFriends);
router.post('/acceptFriendRequest', verifyToken, acceptFriendRequest);
router.get('/posts', verifyToken, getFriendsPosts);
router.post('/rejectFriendRequest', verifyToken, rejectFriendRequest);
router.get('/getInvitations', verifyToken, getInvitations);
router.get('/getInvitationsforsender', verifyToken, getInvitationsforsender);


module.exports = router;