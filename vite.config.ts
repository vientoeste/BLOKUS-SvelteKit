import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		/**
		 * @description node-polyfills is for module events usage in browser(especially EventEmitter)
		 */
		nodePolyfills(),
	],
	server: {
		host: '0.0.0.0',
		port: 5173
	}
};

export default config;
