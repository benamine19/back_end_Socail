
const {Invitation} =require( '../models/invitationModels')
const {User} =require('../models/userModel')
const {Friendship} =require('../models/friendshipModels')
const {Suggestion} =require('../models/suggestionModels.js')

const initializeSuggestions = async (userId) => {
    try {
        const friendships = await Friendship.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        });

        const friendIds = friendships.map(friendship => {
            console.log('friendship', friendship);
            return friendship.user1.toString() === userId.toString() ? friendship.user2 : friendship.user1;
        });
        console.log('friendIds', friendIds);

        const invitations = await Invitation.find({
            $or: [
                { sender: userId },
                { recipient: userId }
            ]
        });

        const invitationIds = invitations.map(invitation => {
            console.log('invitation :', invitation);

            return invitation.sender.toString() === userId.toString() ? invitation.recipient : invitation.sender;
        });
        console.log('invitationIds :', invitationIds);

        const excludedIds = [...friendIds, ...invitationIds, userId];
        console.log('excludedIds :', excludedIds);

        const nonFriends = await User.find({ _id: { $nin: excludedIds } });
        console.log('nonFriends :', nonFriends);

        const suggestions = nonFriends.map(nonFriend => ({
            userId: userId,
            suggestedUserId: nonFriend._id
        }));
        console.log('suggestions :', suggestions);
        await Suggestion.insertMany(suggestions);

        const suggestionss = await Suggestion.find({ userId }).populate('suggestedUserId', 'username email profilePicture');
        console.log('suggestionss :', suggestionss);

    } catch (error) {
        console.error(error);
    }
};


module.exports = {initializeSuggestions}