import { io } from 'socket.io-client';

// In production, this would be your Railway URL
// In development, it defaults to the current window origin
const socket = io();

export default socket;
