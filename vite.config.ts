import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { Server } from 'socket.io';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		{
			name: 'socketio',
			configureServer(server) {
				if (server.httpServer) {
					const io = new Server(server.httpServer);
					// io.on('connection', (socket) => {
					// 	console.log('connected');
					// })
					const room = io.of('/room');
					room.on('connection', (socket) => {
						console.log('room: connected');
						socket.on('disconnect', () => {
							console.log('room: disconnected');
						});
					});
					const game = io.of('/game');
					game.on('connection', (socket) => {
						console.log('game: connected');
						// socket.on('startGame', () => {
						// 	console.log('emitted at viteconfig')
						// })
						socket.on('disconnect', () => {
							console.log('game: disconnected');
						})
					});
				}
			}
		}
	]
};

export default config;
