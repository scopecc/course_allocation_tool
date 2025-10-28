import { useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export default function useSocket(): Socket {
  const socketRef = useRef<Socket>(getSocket());
  return socketRef.current;
}
