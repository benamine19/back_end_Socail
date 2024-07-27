const {User,validateUserCreate,validateUserLogin,validateUpdateCreate}=require('../models/userModel')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken'); // Si vous utilisez JWT pour générer des tokens
const verifyToken=require('../middlewares/verifyToken')
require('dotenv').config();
const {initializeSuggestions}=require('../utils/initializeSuggestions');
const {Post} = require('../models/postModels');
const {Invitation} = require('../models/invitationModels');
const {Friendship }= require('../models/friendshipModels');
const {Comment} = require('../models/commentModels');
const {Like} = require('../models/likeModels');
const mongoose = require('mongoose');

// register User 
const registerUser=async(req,res)=>{
    const {error}=validateUserCreate(req.body)
    if (error){
        return res.status(400).send({'message':error.details})
    }
    const userverify=await User.findOne({email:req.body.email})
    if(userverify){
        return res.status(400).send({message:'this user alredy exist'})
    }
    const salt=await bcrypt.genSalt(10)
    req.body.password =await bcrypt.hash(req.body.password,salt)

    const profilePicture = req.files && req.files.profilePicture ? req.files.profilePicture[0].filename : 'default.png';
    const coverPicture = req.files && req.files.coverPicture ? req.files.coverPicture[0].filename : 'default.png';

    const user_data = {
        username: req.body.username,
        email: req.body.email,
        profilePicture: profilePicture,
        coverPicture: coverPicture,
        password: req.body.password,
    }
    try{
      const user=new User(user_data)
      const data=await user.save()
      const token = jwt.sign({ _id: user._id, email: user.email,name:user.name,profilePicture:user.profilePicture }, process.env.JWT_SECRET_KEY);
      const {password , ...other} = data._doc
    //   await initializeSuggestions(user._id);
      res.status(201).send({
        message:'user created with sucess',
        data:{...other,token}
      })

    }catch(error){
        res.status(500).send({
            message: error.message || "Some error occurred while creating the user."
        });
    }
}
// fin create user 


// Login user 
const loginUser=async(req,res)=>{
    try{
        const {error}=validateUserLogin(req.body)
            if (error){
                return res.status(400).send({'message':error.details})
            }
        
            const user=await User.findOne({email:req.body.email})
            if(! user){
                return res.status(400).send({message:'email or password not valid'})
            }
            const ispassword=await bcrypt.compare(req.body.password,user.password)
            if(!ispassword){
                return res.status(400).send({message:'email or password not valid'})
            }
            const token = jwt.sign({ _id: user._id, username:user.username,email: user.email,name:user.name,profilePicture:user.profilePicture ,coverPicture:user.coverPicture}, process.env.JWT_SECRET_KEY);
            const {password , ...other} = user._doc
            res.status(201).send({
                message:'Login success',
                data:{...other,token}
            })
    }catch(error){

                res.status(500).send({
                message: error.message || "Some error occurred while creating the user."
            });
    }
}
// fin Login user 



// updateUser 
const updateUser = async (req, res) => {
    console.log('rahi bdaat');
    console.log('khalsat lvalidation');

    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
            req.body.profilePicture = `${req.files.profilePicture[0].filename}`;
        }

        if (req.files && req.files.coverPicture && req.files.coverPicture[0]) {
            req.body.coverPicture = `${req.files.coverPicture[0].filename}`;
        }

        // Préparer l'objet de mise à jour
        const updateFields = {
            username: req.body.username,
            email: req.body.email,
            profilePicture: req.body.profilePicture,
            coverPicture: req.body.coverPicture,
            password: req.body.password,
        };
        console.log('updateFields', updateFields);

        // Filtrer les champs null ou indéfinis
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: updateFields
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        await Post.updateMany(
            { 'user.id': new mongoose.Types.ObjectId(req.params.id) },  // Condition de recherche
            {
                $set: {
                    'user.username': req.body.username,
                    'user.profilePicture': req.body.profilePicture,
                }
            }
        );
        await Comment.updateMany(
            { 'user.id': new mongoose.Types.ObjectId(req.params.id) },  // Condition de recherche
            {
                $set: {
                    'user.username': req.body.username,
                    'user.profilePicture': req.body.profilePicture,
                }
            }
        );

        const { password, ...other } = updatedUser._doc;
        res.status(200).send({
            message: "User updated successfully",
            user: other
        });
    } catch (error) {
        console.log('error::', error);
        res.status(500).send({
            message: error.message || "Some error occurred while updating the user."
        });
    }
};
// fin updateUser 


// deleteUser 
const deleteUser=async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
      
        if(!user){
            return res.status(404).send({
                message: "user non trouve."
            });
        }
        await User.findByIdAndDelete(req.params.id)
        res.status(200).send({message:'user has deleted with successufl'})
    }catch(error){
        res.status(500).send({
            message: error.message || "Some error occurred "
        });
    }
}
// fin deleteUser 

// getUsers 
const getUsers=async(req,res)=>{
    try{
        const users=await User.find().select('-password')
        res.status(200).send(users)
    }catch(error){
        res.status(500).send({
            message: error.message || "Some error occurred to find all users."
        });
    }
}
//  fin getUsers 

/// getUserById
const getUserById = async (req, res) => {
    console.log('rahi bdat lfuncitonnnnat');
    const userId = req.user._id;
    const id = req.params.id;
    console.log('id', id);
    if (!id) {
        return res.status(400).send({
            message: "verifier votre id"
        });
    }

    try {
        const user = await User.findById(id).lean();  // Utiliser .lean()
        console.log('user', user);

        if (!user) {
            return res.status(404).send({
                message: "user non trouve."
            });
        }

        console.log('kayn user');
        const { password, ...other } = user;
        const user_info = other;
        
        const posts = await Post.find({ 'user.id': id }).sort({ createdAt: -1 }).lean();  // Utiliser .lean()
        const nbpost = posts.length;
        const isfriend = await Friendship.findOne({
            $or: [
                { user1: userId, user2: id },
                { user1: id, user2: userId }
            ]
        });
        console.log('isfriend :', isfriend)
        const nbfriend=await Friendship.countDocuments({
            $or: [
                { user1: id },
                { user2: id }
            ]
        })
       

        // Ajouter les commentaires et les likes à chaque post
        const postsWithDetails = await Promise.all(posts.map(async post => {
            const comments = await Comment.find({ post: post._id }).lean();
            const likes = await Like.find({ post: post._id }).lean();
            return {
                ...post,
                comments,
                commentsCount: comments.length,
                likesCount: likes.length,
                likes: likes.map(like => like.user),
                userCurrentDidLike: likes.some(like => like.user.toString() === userId.toString())
            };
        }));
        const existingInvitation = await Invitation.findOne({
            sender: userId,
            recipient: id,
            status: { $in: ['pending'] }
          });
          console.log('{ user_info, postsWithDetails, nbpost,isfriend,nbfriend,existingInvitation }',{ user_info, postsWithDetails, nbpost,isfriend,nbfriend,existingInvitation } )
        res.status(200).send({ user_info, postsWithDetails, nbpost,isfriend,nbfriend,existingInvitation });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred to find all users."
        });
    }
};
// fin getUserById 


module.exports ={
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
}