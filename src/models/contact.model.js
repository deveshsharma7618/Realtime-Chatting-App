import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    senderUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending',
        required: true,
    }
}, { timestamps: true })


const Contact = mongoose.model("Contact", contactSchema);

export default Contact;