const runtimeConfig = (globalThis as any).__APP_CONFIG__ || {};

export const API_BASE_URL =
	runtimeConfig.API_BASE_URL || 'http://localhost:3000';
