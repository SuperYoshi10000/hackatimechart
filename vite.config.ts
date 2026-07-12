import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		server: {
			allowedHosts: ["localhost", "hackatimechart.mitchk.hackclub.app"]
		}
	}
});