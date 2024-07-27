const mongoose = require('mongoose');
const Joi = require('joi');

// Schéma Mongoose pour les utilisateurs
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: 'default.png' // Image de profil par défaut
    },
    coverPicture: {
        type: String,
        default: 'default.jpg' // Image de couverture par défaut
    },
    isAdmin: {
        type: Boolean,
        default: false // Par défaut, l'utilisateur n'est pas administrateur
    }
});

// Fonction de validation de création d'utilisateur
function validateUserCreate(user) {
    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        profilePicture: Joi.string().uri().allow(null, ''),
        coverPicture: Joi.string().uri().allow(null, ''),
    });
    return schema.validate(user);
}

// Fonction de validation de création d'utilisateur
function validateUpdateCreate(user) {
    const schema = Joi.object({
        username: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string().min(6),
        profilePicture: Joi.string().uri().allow(null, ''),
        coverPicture: Joi.string().uri().allow(null, ''),
    });
    return schema.validate(user);
}


// Fonction de validation de connexion d'utilisateur
function validateUserLogin(user) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6)
    });
    return schema.validate(user);
}

// Exportez le modèle d'utilisateur et les fonctions de validation
module.exports = {
    User: mongoose.model('User', userSchema),
    validateUserCreate,
    validateUserLogin,
    validateUpdateCreate
};
