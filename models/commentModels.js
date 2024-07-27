const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true },
        profilePicture: { type: String, required: true }
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = {
    Comment: mongoose.model('Comment', commentSchema),
};
