const express=require('express')
const {create_comment,  delete_comment,get_comments_by_post,update_comment}=require('../controllers/commentController')
const router=express.Router()
const {verifyTokenandauthoraization,verifyToken}=require('../middlewares/verifyToken')


router.post('/create_comment', verifyToken,create_comment)
router.delete('/delete_comment/:commentId', verifyToken, delete_comment);
router.get('/get_comments_by_post/:postId', get_comments_by_post);
router.put('/update_comment/:commentId', verifyToken, update_comment);

module.exports = router;