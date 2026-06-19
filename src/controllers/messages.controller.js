import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";

export const getMessageHistory = async (req, res) => {
    try {
        const currentUserEmail = req.user.email;
        const otherUserEmail = req.query.email;

        if (!otherUserEmail) {
            return res.status(400).json({ message: 'Other user email is required' });
        }

        const otherUser = await User.findOne({ email: otherUserEmail });
        if (!otherUser) {
            return res.status(404).json({ message: 'Other user not found' });
        }

        const contact = await Contact.findOne({
            $or: [
                { senderUser: req.user.id, receiverUser: otherUser._id, status: 'accepted' },
                { senderUser: otherUser._id, receiverUser: req.user.id, status: 'accepted' }
            ]
        });

        if (!contact) {
            return res.status(403).json({ message: 'You can only message accepted contacts' });
        }

        const messages = await Message.find({
            $or: [
                { senderEmail: currentUserEmail, receiverEmail: otherUserEmail },
                { senderEmail: otherUserEmail, receiverEmail: currentUserEmail }
            ]
        }).sort({ createdAt: 1 });
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    getMessageHistory
};
