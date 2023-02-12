import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import WebSocket, { WebSocketServer } from 'ws';

const config: UserConfig = {
	plugins: [sveltekit(), {
		name: 'wss',
		configureServer(server) {
			if (server.httpServer) {
				// const io = new Server(server.httpServer);
				// [TODO] io.on comes here
				// console.log('wss opened');
			}
		}
	}]
};

export default config;
