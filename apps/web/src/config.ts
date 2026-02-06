const getViteEnv = (): { VITE_API_BASE_URL?: string } | undefined => {
  try {
    return new Function('return import.meta.env')() as {
      VITE_API_BASE_URL?: string;
    };
  } catch {
    return undefined;
  }
};

const viteEnv = getViteEnv();
const nodeEnvApiUrl =
  typeof process !== 'undefined' ? process.env.VITE_API_BASE_URL : undefined;
const envApiUrl = viteEnv?.VITE_API_BASE_URL || nodeEnvApiUrl;

export const API_BASE_URL = envApiUrl || 'http://localhost:3000';
