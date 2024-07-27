const express=require('express')
const {registerUser,loginUser,getUsers,getUserById,updateUser,deleteUser}=require('../controllers/userController')
const {verifyTokenandauthoraization}=require('../middlewares/verifyToken')
const router=express.Router()
const upload = require('../config/multerConfig'); // Import Multer config
const {verifyToken} = require('../middlewares/verifyToken');



router.post('/registerUser', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]),registerUser)
router.post('/loginUser',loginUser)
router.get('/getUsers',getUsers)
router.get('/getUserById/:id',verifyToken,getUserById)
router.put('/updateUser/:id',verifyTokenandauthoraization,upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]),updateUser)
router.delete('/deleteUser/:id',deleteUser)

module.exports=router