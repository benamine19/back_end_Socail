const express=require('express')
const {create_post,update_post,delete_post,get_all_posts,getFriendsPosts}=require('../controllers/postController')
const router=express.Router()
const upload = require('../config/multerConfig'); // Import Multer config
const {verifyTokenandauthoraization,verifyToken}=require('../middlewares/verifyToken')


router.post('/create_post', upload.single('image'),create_post)

router.get('/get_all_posts',get_all_posts)

router.delete('/delete_post/:id',verifyToken,delete_post)

router.put('/update_post/:id',verifyToken,upload.single('image'),update_post)

router.get('/posts', verifyToken, getFriendsPosts);


module.exports = router;
