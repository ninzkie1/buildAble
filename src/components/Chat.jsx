import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, X } from 'lucide-react';
import config from '../config/config';

export default function Chat({ sellerId, orderId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { user } = useContext(AuthContext);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const messagesEndRef = useRef(null); // Add this ref

  // Add auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add effect for auto-scrolling
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = useCallback(async () => {
    try {
      console.log('Fetching chat for order:', orderId);
      const response = await fetch(`${config.apiUrl}/api/chat/history/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat data received:', data);

      if (data.success && Array.isArray(data.messages)) {
        const formattedMessages = data.messages.map(message => ({
          ...message,
          senderId: message.sender?._id || message.senderId,
          sender: {
            _id: message.sender?._id || message.senderId,
            name: message.sender?.name || 'Unknown'
          },
          timestamp: message.createdAt || message.timestamp
        }));
        setMessages(formattedMessages);
      } else {
        console.error('Invalid message data:', data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setConnectionStatus('error');
    }
  }, [orderId, user.token]);

  const connectWebSocket = useCallback(() => {
    if (ws.current?.readyState === 1) return;
    
    try {
      const wsUrl = config.getWebSocketUrl({
        userId: user._id,
        receiverId: sellerId,
        orderId: orderId
      });
      console.log('Connecting WebSocket:', wsUrl);
      
      ws.current = new WebSocket(wsUrl);
      setConnectionStatus('connecting');
      
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 5;
      
      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setConnectionStatus('connected');
        reconnectAttempts = 0;
        // Refresh history on successful (re)connect
        fetchChatHistory();
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages(prev => {
          const messageExists = prev.some(m => m._id === message._id);
          return messageExists ? prev : [...prev, message];
        });
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setConnectionStatus('disconnected');
        ws.current = null;
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
          reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
        } else {
          console.log('Max reconnection attempts reached');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    }
  }, [user._id, sellerId, orderId, fetchChatHistory]);

  useEffect(() => {
    fetchChatHistory();
    connectWebSocket();
    
    return () => {
      // Cleanup function
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [fetchChatHistory, connectWebSocket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== 1) return;

    const messageData = {
      senderId: user._id,
      receiverId: sellerId,
      content: newMessage.trim(),
      orderId: orderId,
      timestamp: new Date().toISOString()
    };

    try {
      ws.current.send(JSON.stringify(messageData));
      setNewMessage('');
    } catch (error) {
      console.error('Send Error:', error);
      setConnectionStatus('error');
    }
  };

  // Add loading indicator
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Chat with Seller</h3>
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
        </div>
        <button onClick={onClose}>
          <X size={20} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            // Explicitly check against user._id for sender status
            const isSender = message.sender._id === user._id || message.senderId === user._id;
            return (
              <div
                key={message._id || index}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                {!isSender && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-gray-600">
                      {message.sender?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isSender
                      ? 'bg-[#B84937] text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {isSender && (
                  <div className="w-8 h-8 rounded-full bg-[#B84937] flex items-center justify-center ml-2">
                    <span className="text-sm font-medium text-white">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              No messages yet. Start the conversation!
            </div>
          )}
          {/* Add this div for scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-[#B84937]"
          />
          <button
            type="submit"
            className="p-2 bg-[#B84937] text-white rounded-lg hover:bg-[#9E3C2D]"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}