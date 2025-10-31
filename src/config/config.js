const config = {
  apiUrl: 'http://localhost:5000',
  wsUrl: 'ws://localhost:5000',
  getWebSocketUrl: function(params) {
    const baseUrl = this.wsUrl.endsWith('/') ? this.wsUrl.slice(0, -1) : this.wsUrl;
    const query = new URLSearchParams(params).toString();
    return `${baseUrl}/ws?${query}`;
  }
};

export default config;