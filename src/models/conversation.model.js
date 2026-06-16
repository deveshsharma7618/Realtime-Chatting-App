import mongoose from "mongoose";

const conversationSchema  = mongoose.Schema({
    participants: [
        {
            type: String,
            ref: "User",
            required: true,
            match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        }
    ],
    messages : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: true
        }
    ]
})

conversationSchema.index({
    participants: 1
 })

export default mongoose.model('Conversation', conversationSchema);