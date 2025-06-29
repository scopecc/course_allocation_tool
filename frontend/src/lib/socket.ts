import { io } from "socket.io-client";

// change to env.local later
export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});
