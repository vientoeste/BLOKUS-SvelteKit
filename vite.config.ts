import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig, ViteDevServer } from 'vite';
import WebSocket, { WebSocketServer } from 'ws';

interface PluginOptions {
	name: string;
	wss?: WebSocketServer;
	configureServer: (pluginOptions: PluginOptions, server: ViteDevServer) => void;
}

const pluginOptions: PluginOptions = {
	name: 'wss',
	wss: undefined,
	configureServer: (pluginOptions: PluginOptions, server: ViteDevServer) => {
		console.log(pluginOptions);
		console.log(pluginOptions?.wss ?? '123');
		if (server.httpServer && !pluginOptions.wss) {
			pluginOptions.wss = new WebSocketServer({
				server: server.httpServer,
			});
			pluginOptions.wss.on('connection', (socket) => {
				console.log('connected');
				// [TODO] socket.url goes undefined
				if (socket.url?.includes('/game')) {
					socket.on('message', (data: unknown) => {
						console.log(`Received message for /game endpoint: ${data}`);
					});
				}
			});
			pluginOptions.wss.on('error', (e) => {
				console.error(e)
			});
		}
	}
};

const config: UserConfig = {
	plugins: [
		sveltekit(),
		{
			...pluginOptions,
			configureServer: (server: ViteDevServer) =>
				pluginOptions.configureServer(pluginOptions, server)
		}
	]
};

export default config;
