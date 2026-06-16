import User from "../models/user.model.js";

const deleteUser = async (req, res) => {
    const email = req.user.email;
    const requiredUser = await User.findOneAndDelete({ email  : email });

    req.cookies = '';
    res.json({
        success: true,
        message: `User with email ${email} has been deleted.`
    });
}


const updateUser = async (req, res) => {
    const { email, status } = req.user;
    const { username } = req.body;

    if(status == "unverified") {
        return res.status(403).json({
            success: false,
            message: "User is not verified. Cannot update user details."
        });
    }
    

    const updatedUser = await User.findOneAndUpdate({ email }, { username }, { returnDocument: 'after' });

    res.json({
        success: true,
        message: `User with email ${email} has been updated.`,
        user: updatedUser
    });
}


export { deleteUser, updateUser };