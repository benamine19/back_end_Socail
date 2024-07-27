const {User}=require('../models/userModel')
const {Post}=require('../models/postModels')
const {Invitation} = require('../models/invitationModels');
const {Friendship }= require('../models/friendshipModels');
const {Comment} = require('../models/commentModels');
const {Like} = require('../models/likeModels');
// create_post
// private


const create_post=async(req,res)=>{
    console.log('req.body', req.body)

    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    if( !req.body.user_id || !req.body.username || !req.body.profilePicture){
        return res.status(400).json({ message: "some fields empty" }); // Ajout du return
    }
    const user_data={
        id:req.body.user_id,
        username:req.body.username,
        profilePicture: req.body.profilePicture,
    }
    const post_data={
        user:user_data,
        content:req.body.content,
        image: req.body.image,
    }
    try{
        const post=new Post(post_data)
        const data =await post.save()
        res.status(201).json({
        message:'user created with sucess',data :data })
    }catch(error){
        console.log('error', error)
        res.status(500).send({
            message: error.message || "Some error occurred while creating the user."
        });
    }
}
// fin create_post

//  delete_post
const delete_post = async (req, res) => {
    try {
        const postexist = await Post.findById(req.params.id );
        if (!postexist) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if(postexist.user.id.toString() !== req.user._id){
            return res.status(403).json({ message: 'not authoraized' });
        }
        const post = await Post.findByIdAndDelete(req.params.id );
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while deleting the post." });
    }
};
//  fin delete_post

//   update_post
const update_post = async (req, res) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    try {
        const postexist = await Post.findById(req.params.id);
        if (!postexist) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if(postexist.user.id.toString() !== req.user._id){
            return res.status(403).json({ message: 'not authoraized' });
        }
        const post = await Post.findByIdAndUpdate(req.params.id,{
            content:req.body.content,
            image: req.body.image,
            updatedAt:Date.now()
        },{new:true});
        res.status(200).json({ message: 'Post updated successfully', data: post });
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while updating the post." });
    }
};
//  fin update_post

// get_all_posts
const get_all_posts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while retrieving the posts." });
    }
};

// Obtenir les posts des amis avec commentaires et likes
const getFriendsPosts = async (req, res) => {
    const userId = req.user._id;

    try {
        // Trouver les amis de l'utilisateur
        const friendships = await Friendship.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        });

        // Récupérer les IDs des amis
        const friendIds = friendships.map(f => (f.user1.toString() === userId.toString() ? f.user2 : f.user1));

        // Ajouter l'utilisateur lui-même à la liste des IDs
        friendIds.push(userId);

        // Trouver les posts des amis et de l'utilisateur, triés par date de création
        const posts = await Post.find({ 'user.id': { $in: friendIds } }).lean().sort({ createdAt: -1 });

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

        res.status(200).json(postsWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while retrieving friends' posts." });
    }
};

module.exports = {
    create_post,
    delete_post,
    update_post,
    get_all_posts,
    getFriendsPosts
};
