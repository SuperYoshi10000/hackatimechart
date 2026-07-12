import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		plugins: [sveltekit()],
		server: {
			allowedHosts: ["localhost", "hackatimechart.mitchk.hackclub.app"]
		}
	}
});