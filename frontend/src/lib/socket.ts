import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Connected to WebSocket:", socket!.id);
      }
    });

    socket.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Disconnected:", reason);
      }
    });
  }
  return socket;
};
