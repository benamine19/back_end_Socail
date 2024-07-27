const { Comment } = require('../models/commentModels'); // Assurez-vous que le chemin est correct




// Créer un commentaire
const create_comment = async (req, res) => {
    if (!req.body.user_id || !req.body.username || !req.body.profilePicture || !req.body.content || !req.body.post) {
        return res.status(400).json({ message: "some fields are empty" });
    }

    const user_data = {
        id: req.body.user_id,
        username: req.body.username,
        profilePicture: req.body.profilePicture,
    };

    const comment_data = {
        user: user_data,
        content: req.body.content,
        post: req.body.post,
    };
    if(req.body.user_id !== req.user._id){
        return res.status(403).json({ message: 'not authoraized' });
    }

    try {
        const comment = new Comment(comment_data); // Créer une nouvelle instance du modèle Comment
        const data = await comment.save();
        res.status(201).json({
            message: 'Comment created with success',
            data: data
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating the comment."
        });
    }
};
// fin de Créer un commentaire


// Supprimer un commentaire
const delete_comment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user.id.toString() !== req.user._id) {
            return res.status(403).json({ message: 'not authorized' });
        }
        const comm = await Comment.findByIdAndDelete(req.params.commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while deleting the comment." });
    }
};

// Récupérer tous les commentaires pour un post
const get_comments_by_post = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while retrieving the comments." });
    }
};


// Mettre à jour un commentaire
const update_comment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user.id.toString() !== req.user._id) {
            return res.status(403).json({ message: 'not authorized' });
        }
        comment.content = req.body.content || comment.content;
        const updatedComment = await comment.save();
        res.status(200).json({
            message: 'Comment updated successfully',
            data: updatedComment
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while updating the comment." });
    }
};



module.exports = {
    create_comment,
    delete_comment,
    get_comments_by_post,
    update_comment
};
