const config = {
  // apiUrl: 'http://localhost:5000',
  // wsUrl: 'ws://localhost:5000',
  // getWebSocketUrl: function(params) {
  //   const baseUrl = this.wsUrl.endsWith('/') ? this.wsUrl.slice(0, -1) : this.wsUrl;
  //   const query = new URLSearchParams(params).toString();
  //   return `${baseUrl}/ws?${query}`;






//for production 
apiUrl: 'https://buildablebackend.onrender.com',
wsUrl: 'wss://buildablebackend.onrender.com',
getWebSocketUrl: function(params) {
  try {
    if (!params.userId || !params.receiverId || !params.orderId) {
      throw new Error('Missing required WebSocket parameters');
    }

    const baseUrl = this.wsUrl.endsWith('/') ? this.wsUrl.slice(0, -1) : this.wsUrl;
    const query = new URLSearchParams({
      userId: params.userId,
      receiverId: params.receiverId,
      orderId: params.orderId
    }).toString();

    return `${baseUrl}/ws?${query}`;
  } catch (error) {
    console.error('Error creating WebSocket URL:', error);
    throw error;
  }
}
};

// Add connection helper
config.testConnection = async function() {
try {
  const response = await fetch(`${this.apiUrl}/api/health`);
  if (!response.ok) throw new Error('API health check failed');
  return true;
} catch (error) {
  console.error('Backend connection test failed:', error);
  return false;


  }
};



//for production 

export default config;