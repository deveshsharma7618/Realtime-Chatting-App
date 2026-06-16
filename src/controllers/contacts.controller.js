import User from "../models/user.model.js";

export const getContacts =  async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('username email');
    
    return res.status(200).json(users);
}

export default {
    getContacts
}