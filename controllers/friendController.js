const {Invitation} = require('../models/invitationModels');
const {Friendship }= require('../models/friendshipModels');
const {Post} = require('../models/postModels');
const {User} = require('../models/userModel');
const {Comment} = require('../models/commentModels');
const {Like} = require('../models/likeModels');
const {Suggestion} = require('../models/suggestionModels');
const {Notification} = require('../models/notificationModels');



// Envoyer une invitation d'ami
const sendFriendRequest = async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user._id;
    try {
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Vérifier si une invitation existe déjà
        const existingInvitation = await Invitation.findOne({
            $or: [
                { sender: senderId, recipient: receiverId },
                { sender: receiverId, recipient: senderId }
            ],
            status: { $in: ['pending', 'accepted'] }
        });
        if (existingInvitation) {
            return res.status(400).json({ message: 'Friend request already sent.' });
        }
        // Vérifier si une amitié existe déjà
        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1: senderId, user2: receiverId },
                { user1: receiverId, user2: senderId }
            ]
        });
        if (existingFriendship) {
            return res.status(400).json({ message: 'You are already friends.' });
        }
        const invitation = new Invitation({ sender: senderId, recipient: receiverId });
        await invitation.save();
        // Générer une notification
        const senderUser = await User.findById(req.user._id); // Assurez-vous d'avoir ce modèle
        console.log('senderUser in invitation ::::', senderUser)
        const notification = new Notification({
             user: receiverId,
            type: 'invitation',
            content: `Vous avez reçu une invitation de ${senderUser.username}`
           });
        console.log('notification in invitation ::::', notification)
        await notification.save();
        res.status(201).json({ message: 'Friend request sent successfully.',invitation });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Some error occurred while sending the friend request.' });
    }
};

// Accepter une invitation d'ami
const acceptFriendRequest = async (req, res) => {
    const { invitationId } = req.body;
    try {
        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found.' });
        }
        if (invitation.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to accept this invitation.' });
        }
        invitation.status = 'accepted';
        await invitation.save();

        const friendship = new Friendship({ user1: invitation.sender, user2: invitation.recipient });
        await friendship.save();

        res.status(200).json({ message: 'Friend request accepted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Some error occurred while accepting the friend request.' });
    }
};


const rejectFriendRequest = async (req, res) => {
    try {
        const { invitationId } = req.body;
        
        // Vérifiez si l'invitation existe
        const invitationExist = await Invitation.findById(invitationId);
        if (!invitationExist) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Vérifiez si l'utilisateur est le destinataire de l'invitation
        if (invitationExist.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Supprimez l'invitation
        await Invitation.findByIdAndDelete(invitationId);
        
        res.status(200).json({ message: 'Invitation deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while rejecting the invitation."
        });
    }
};


// bah ychoof luser chkoon b3athlo 
const getInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({ recipient: req.user._id ,status: 'pending'}).populate('sender', 'username profilePicture');
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while retrieving the invitations."
        });
    }
};

// bah ychoof luser limn raho ba3th b3athlo 
const getInvitationsforsender = async (req, res) => {
    try {
        const invitations = await Invitation.find({ sender: req.user._id,status:'pending' }).populate('recipient', 'username profilePicture');
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while retrieving the invitations."
        });
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
        const friendIds = friendships.map(f => (f.user1.toString() === userId.toString() ? f.user2 : f.user1));

        // Trouver les posts des amis
        const posts = await Post.find({ 'user.id': { $in: friendIds } }).lean();

        // Ajouter les commentaires et les likes à chaque post
        const postsWithDetails = await Promise.all(posts.map(async post => {
            const comments = await Comment.find({ post: post._id }).lean();
            const likes = await Like.find({ post: post._id }).lean();
            return {
                ...post,
                comments,
                likesCount: likes.length,
                likes: likes.map(like => like.user)
            };
        }));

        res.status(200).json(postsWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message || "Some error occurred while retrieving friends' posts." });
    }
};


// Obtenir les posts des amis
// const getFriendsPosts = async (req, res) => {
//     try {
//         // Trouver tous les amis de l'utilisateur connecté
//         const friendships = await Friendship.find({
//             $or: [{ user1: req.user._id }, { user2: req.user._id }]
//         });

//         const friendIds = friendships.map(friendship => {
//             return friendship.user1.toString() === req.user._id.toString()
//                 ? friendship.user2
//                 : friendship.user1;
//         });

//         // Trouver tous les posts des amis
//         const posts = await Post.find({ 'user.id': { $in: friendIds } }).populate('user.id', 'username profilePicture');

//         res.status(200).json(posts);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message || "Some error occurred while retrieving friends' posts."
//         });
//     }
// };
// get the friends odf user 
const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        const search = req.query.search || ''; // Term de recherche, par défaut une chaîne vide
        // Rechercher des amitiés pour l'utilisateur
        const friendships = await Friendship.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        }).populate('user1 user2', 'username email profilePicture');

        // Obtenir les amis
        const friends = friendships.map(friendship => {
            return friendship.user1._id.toString() === userId ? friendship.user2 : friendship.user1;
        });

        // Filtrer les amis en fonction du terme de recherche
        const filteredFriends = friends.filter(friend => 
            friend.username.toLowerCase().includes(search.toLowerCase()) ||
            friend.email.toLowerCase().includes(search.toLowerCase())
        );
        res.status(200).json(filteredFriends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get the non friends of user
const getNonFriends = async (req, res) => {
    try {
        const userId =req.user._id;
        const friendships = await Friendship.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        });
        const friendIds = friendships.map(friendship => {
          

            return friendship.user1.toString() === userId ? friendship.user2 : friendship.user1;
        });

        const invitations = await Invitation.find({
            $or: [
                { sender: userId },
                { recipient: userId }
            ]
        });

        const invitationIds = invitations.map(invitation => {

            return invitation.sender.toString() === userId.toString() ? invitation.recipient : invitation.sender;
        });


        const excludedIds = [...friendIds, ...invitationIds, userId];

        const nonFriends = await User.find({ _id: { $nin: excludedIds } }).select('_id username profilePicture');

        res.status(200).json(nonFriends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get les couples existe
const getAllFriends = async (req, res) => {
    try {
        const friendships = await Friendship.find()
            .populate('user1', 'username email profilePicture')
            .populate('user2', 'username email profilePicture');

        const friendsList = friendships.map(friendship => ({
            user1: {
                _id: friendship.user1._id,
                username: friendship.user1.username,
                email: friendship.user1.email,
                profilePicture: friendship.user1.profilePicture
            },
            user2: {
                _id: friendship.user2._id,
                username: friendship.user2.username,
                email: friendship.user2.email,
                profilePicture: friendship.user2.profilePicture
            },
            createdAt: friendship.createdAt
        }));

        res.status(200).json(friendsList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Rechercher un utilisateur par nom d'utilisateur ou email
const searchUser = async (req, res) => {
    try {
        const { search } = req.query;

        // Rechercher l'utilisateur par nom d'utilisateur ou email
        const users = await User.find({
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }).select('_id username email profilePicture');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




























module.exports = {
    sendFriendRequest,
    searchUser,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsPosts,
    getInvitations,
    getFriends,
    getAllFriends,
    getNonFriends,
    getInvitationsforsender
};
