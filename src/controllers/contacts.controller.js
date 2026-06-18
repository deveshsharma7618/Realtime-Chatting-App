import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";

export const getContacts = async (req, res) => {
    try {
        const acceptedContacts = await Contact.find({
            $or: [
                { senderUser: req.user.id, status: 'accepted' },
                { receiverUser: req.user.id, status: 'accepted' }
            ]
        }).populate('senderUser', 'username email').populate('receiverUser', 'username email');

        const users = acceptedContacts.map(c => {
            return String(c.senderUser._id) === String(req.user.id) ? c.receiverUser : c.senderUser;
        });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const searchContact = async (req, res) => {
    try {
        const { search_contact } = req.body;
        if (!search_contact) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const user = await User.findOne({ 
            $or: [{ email: search_contact }, { username: search_contact }],
            _id: { $ne: req.user.id }
        }).select('username email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const contact = await Contact.findOne({
            $or: [
                { senderUser: req.user.id, receiverUser: user._id },
                { senderUser: user._id, receiverUser: req.user.id }
            ]
        });

        let relationship = 'none';
        if (contact) {
            if (contact.status === 'accepted') {
                relationship = 'accepted';
            } else if (contact.status === 'pending') {
                if (String(contact.senderUser) === String(req.user.id)) {
                    relationship = 'pending_sent';
                } else {
                    relationship = 'pending_received';
                }
            } else if (contact.status === 'blocked') {
                relationship = 'blocked';
            }
        }

        return res.status(200).json({
            user,
            relationship,
            contactId: contact ? contact._id : null
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const sendContactRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Receiver email is required' });
        }

        const receiverUser = await User.findOne({ email });
        if (!receiverUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (String(receiverUser._id) === String(req.user.id)) {
            return res.status(400).json({ message: 'Cannot add yourself' });
        }

        const existingContact = await Contact.findOne({
            $or: [
                { senderUser: req.user.id, receiverUser: receiverUser._id },
                { senderUser: receiverUser._id, receiverUser: req.user.id }
            ]
        });

        if (existingContact) {
            return res.status(400).json({ 
                message: `Contact request already exists. Status: ${existingContact.status}` 
            });
        }

        const newContact = new Contact({
            senderUser: req.user.id,
            receiverUser: receiverUser._id,
            status: 'pending'
        });

        await newContact.save();
        return res.status(200).json({ message: 'Contact request sent successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Contact.find({
            receiverUser: req.user.id,
            status: 'pending'
        }).populate('senderUser', 'username email');
        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const acceptContactRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        if (!requestId) {
            return res.status(400).json({ message: 'Request ID is required' });
        }

        const contact = await Contact.findOne({
            _id: requestId,
            receiverUser: req.user.id,
            status: 'pending'
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact request not found' });
        }

        contact.status = 'accepted';
        await contact.save();

        await User.findByIdAndUpdate(contact.senderUser, {
            $addToSet: { contacts: contact._id }
        });
        await User.findByIdAndUpdate(contact.receiverUser, {
            $addToSet: { contacts: contact._id }
        });

        return res.status(200).json({ message: 'Contact request accepted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const rejectContactRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        if (!requestId) {
            return res.status(400).json({ message: 'Request ID is required' });
        }

        const contact = await Contact.findOneAndDelete({
            _id: requestId,
            $or: [
                { receiverUser: req.user.id },
                { senderUser: req.user.id }
            ]
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact request not found' });
        }

        await User.findByIdAndUpdate(contact.senderUser, {
            $pull: { contacts: contact._id }
        });
        await User.findByIdAndUpdate(contact.receiverUser, {
            $pull: { contacts: contact._id }
        });

        return res.status(200).json({ message: 'Contact request rejected/cancelled successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    getContacts,
    searchContact,
    sendContactRequest,
    getPendingRequests,
    acceptContactRequest,
    rejectContactRequest
};