import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderEmail: {
        type: String,
        ref: "User",
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    receiverEmail: {
        type: String,
        ref: "User",
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sending', 'sent', 'received', 'read'],
        default: "sending"
    },
}, { timestamps: true })

messageSchema.index( { senderEmail : 1, receiverEmail : 1})

export default mongoose.model('Message', messageSchema);