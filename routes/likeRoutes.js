const express = require('express');
const { add_like, remove_like, get_likes_by_post,get_posts_with_likes_and_comments } = require('../controllers/likeController');
const router = express.Router();
const {verifyToken}=require('../middlewares/verifyToken')

router.post('/add_like', verifyToken, add_like);
router.delete('/remove_like', verifyToken, remove_like);
router.get('/get_likes_by_post/:postId', get_likes_by_post);
router.get('/get_posts_with_likes_and_comments', get_posts_with_likes_and_comments);

module.exports = router;