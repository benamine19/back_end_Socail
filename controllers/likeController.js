const {Like} = require('../models/likeModels');
const { Post } = require('../models/postModels');
const { Comment } = require('../models/commentModels');

// Ajouter un like
const add_like = async (req, res) => {
    try {
        const { user_id, post_id } = req.body;
        if (!user_id || !post_id) {
            return res.status(400).json({ message: "some fields are empty" });
        }
        const likeExists = await Like.findOne({ user: user_id, post: post_id });
        if (likeExists) {
            return res.status(400).json({ message: "User already liked this post" });
        }
        const like = new Like({ user: user_id, post: post_id });
        const data = await like.save();
        res.status(201).json({
            message: 'Like added successfully',
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while adding the like." });
    }
};

// Supprimer un like
const remove_like = async (req, res) => {
    try {
        const { user_id, post_id } = req.body;
        if (!user_id || !post_id) {
            return res.status(400).json({ message: "some fields are empty" });
        }

        const like = await Like.findOneAndDelete({ user: user_id, post: post_id });
        if (!like) {
            return res.status(404).json({ message: "Like not found" });
        }

        res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while removing the like." });
    }
};

// Obtenir tous les likes pour un post
const get_likes_by_post = async (req, res) => {
    try {
        const likes = await Like.find({ post: req.params.postId }).populate('user', 'username profilePicture');
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while retrieving the likes." });
    }
};
const get_posts_with_likes_and_comments = async (req, res) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'likes'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments'
                }
            },
            {
                $addFields: {
                    likeCount: { $size: '$likes' },
                    commentCount: { $size: '$comments' }
                }
            }
        ]);

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while fetching posts." });
    }
};


module.exports = {
    add_like,
    remove_like,
    get_likes_by_post,
    get_posts_with_likes_and_comments

};
