import express from 'express'
import http from "http"
import { Server } from "socket.io"
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import utilsRoutes from './routes/utils.routes.js';
import contactRoutes from './routes/contacts.routes.js';
import { sendEmail } from './utils/sendEmail.js';
import path from 'path';

const app = express()

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    const rawCookies = socket.request.headers.cookie;

    // Listen for incoming messages from a specific client
    socket.on('chat message', (data) => {
        // Broadcast the message to all connected clients
        io.emit('chat message', data);
    });

    // Detect user disconnection
    socket.on('disconnect', () => {
    });

});

app.use(express.static(path.join(path.resolve(), 'public')))


app.use(express.json())
app.use(cookieParser())



app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.use('/api/auth', authRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/contacts', contactRoutes);

export { app, server, io };
export default app;