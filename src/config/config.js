const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
};

export default config;