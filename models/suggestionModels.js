const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    suggestedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = {Suggestion:mongoose.model('Suggestion', suggestionSchema)}