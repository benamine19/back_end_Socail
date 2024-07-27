const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
    user: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true },
        profilePicture: { type: String, required: true }
    },
    content: { type: String, required: true },
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default:null }
});

module.exports = mongoose.model('Post', postSchema);

// Fonction de validation de création de publication
function validatePostCreate(post) {
    const schema = Joi.object({
        user: Joi.object({
            id: Joi.string().required(),
            username: Joi.string().required(),
            profilePicture: Joi.string().required()
        }).required(),
        content: Joi.string().required(),
        image: Joi.string().uri().allow(null, '')
    });
    return schema.validate(post);
}

module.exports = {
    Post: mongoose.model('Post', postSchema),
    validatePostCreate
};
