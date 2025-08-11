import { io } from "socket.io-client";

// change to env.local later
export const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, {
  transports: ["websocket"],
});
