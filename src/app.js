import express from 'express'
import http from "http"
import { Server } from "socket.io"
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import config from "./config/env.js";
import User from "./models/user.model.js";
import Contact from "./models/contact.model.js";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";
import authRoutes from './routes/auth.routes.js';
import utilsRoutes from './routes/utils.routes.js';
import contactRoutes from './routes/contacts.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import { sendEmail } from './utils/sendEmail.js';
import path from 'path';
import cors from 'cors';

const app = express()

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const parseCookies = (cookieString) => {
    if (!cookieString) return {};
    return cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=').map(c => c.trim());
        acc[key] = value;
        return acc;
    }, {});
};

const activeSockets = new Map(); // userId -> Set of sockets
app.set('activeSockets', activeSockets);

async function broadcastStatusToContacts(user, status) {
    try {
        const userIdStr = String(user.id);
        const userEmail = user.email;

        // Find all accepted contacts of the user
        const contacts = await Contact.find({
            $or: [
                { senderUser: userIdStr, status: 'accepted' },
                { receiverUser: userIdStr, status: 'accepted' }
            ]
        });

        contacts.forEach(contact => {
            const contactId = String(contact.senderUser) === userIdStr 
                ? String(contact.receiverUser) 
                : String(contact.senderUser);

            const recipientSockets = activeSockets.get(contactId);
            if (recipientSockets) {
                recipientSockets.forEach(s => {
                    s.emit('user status', {
                        email: userEmail,
                        status: status
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error broadcasting status:", error);
    }
}

io.on('connection', (socket) => {
    const rawCookies = socket.request.headers.cookie;
    const cookies = parseCookies(rawCookies);
    const token = cookies.token;
    let user = null;

    if (token) {
        try {
            user = jwt.verify(token, config.jwtSecret);
            socket.user = user;
            const userIdStr = String(user.id);
            const userSockets = activeSockets.get(userIdStr) || new Set();
            const wasOffline = userSockets.size === 0;
            userSockets.add(socket);
            activeSockets.set(userIdStr, userSockets);

            if (wasOffline) {
                broadcastStatusToContacts(user, 'online');
            }
        } catch (err) {
            console.error("Socket JWT verification failed:", err.message);
        }
    }

    // Fallback broadcast chat message
    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    // Handle private message event
    socket.on('private message', async (data) => {
        if (!socket.user) {
            return socket.emit('error', { message: 'Unauthorized connection' });
        }


        const senderEmail = socket.user.email;
        const senderUserId = socket.user.id;
        const { to: receiverEmail, text } = data;

        if (!receiverEmail || !text) {
            return socket.emit('error', { message: 'Recipient email and text are required' });
        }

        try {
            const receiverUser = await User.findOne({ email: receiverEmail });
            if (!receiverUser) {
                return socket.emit('error', { message: 'Recipient user not found' });
            }

            const receiverUserId = String(receiverUser._id);

            const contact = await Contact.findOne({
                $or: [
                    { senderUser: senderUserId, receiverUser: receiverUserId, status: 'accepted' },
                    { senderUser: receiverUserId, receiverUser: senderUserId, status: 'accepted' }
                ]
            });

            if (!contact) {
                return socket.emit('error', { message: 'You can only message accepted contacts' });
            }

            const message = new Message({
                senderEmail,
                receiverEmail,
                content: text,
                status: 'sent'
            });
            await message.save();

            let conversation = await Conversation.findOne({
                participants: { $all: [senderEmail, receiverEmail] }
            });
            if (!conversation) {
                conversation = new Conversation({
                    participants: [senderEmail, receiverEmail],
                    messages: []
                });
            }
            conversation.messages.push(message._id);
            await conversation.save();

            const messagePayload = {
                senderEmail,
                receiverEmail,
                content: text,
                createdAt: message.createdAt,
                _id: message._id
            };

            const receiverSockets = activeSockets.get(receiverUserId);
            if (receiverSockets) {
                receiverSockets.forEach(s => s.emit('private message', messagePayload));
            }

            const senderSockets = activeSockets.get(String(senderUserId));
            if (senderSockets) {
                senderSockets.forEach(s => s.emit('private message', messagePayload));
            }

        } catch (error) {
            console.error("Error sending private message:", error);
            socket.emit('error', { message: 'Failed to send private message' });
        }
    });

    socket.on('disconnect', () => {
        if (socket.user) {
            const userIdStr = String(socket.user.id);
            const userSockets = activeSockets.get(userIdStr);
            if (userSockets) {
                userSockets.delete(socket);
                if (userSockets.size === 0) {
                    activeSockets.delete(userIdStr);
                    broadcastStatusToContacts(socket.user, 'offline');
                }
            }
        }
    });
});

app.use(express.static(path.join(path.resolve(), 'public')))
app.use(cors());
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.use('/api/auth', authRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messagesRoutes);

export { app, server, io };
export default app;