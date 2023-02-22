import { io as ioClient } from "socket.io-client";

const socket = ioClient('/game');
export const io = socket;
