import { Server } from 'http';
import * as socketIO from 'socket.io';

export let io: SocketIO.Server;
export function initializeSocketServer(server: Server): Promise<SocketIO.Server> {
    return new Promise((resolve, reject) => {
        let socketServer = io = socketIO(server, {
            origins: '*:*'
        });
        resolve(socketServer);
    });
}
