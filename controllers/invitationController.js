const {Invitation} = require('../models/invitationModel');
const {User} = require('../models/userModel');
const {Notification} = require('../models/notificationModels');

const sendInvitation = async (req, res) => {
    console.log('raaahi bdaaat :::')
    const { receiverId } = req.body;
    console.log('raaahi bdaaat :::')
    try {
        const invitation = new Invitation({
            sender: req.user._id,
            receiver: receiverId
        });
        const data = await invitation.save();
        console.log('data in invitation ::::', data)

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
        res.status(201).json({
            message: 'Invitation sent successfully',
            data: data
        });
        console.log('notification successs')

    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while sending the invitation."
        });
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).json({ message: 'Invitation accepted successfully' });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while accepting the invitation."
        });
    }
};

const rejectInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        invitation.status = 'rejected';
        await invitation.save();

        res.status(200).json({ message: 'Invitation rejected successfully' });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while rejecting the invitation."
        });
    }
};

const getInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({ receiver: req.user._id }).populate('sender', 'username profilePicture');
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while retrieving the invitations."
        });
    }
};

module.exports = {
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    getInvitations
};
