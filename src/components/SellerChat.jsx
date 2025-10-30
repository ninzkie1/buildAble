import React, { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, X } from 'lucide-react';

export default function SellerChat({ userId, orderId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = () => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      ws.current = new WebSocket(
        `ws://localhost:5000?userId=${user._id}&receiverId=${userId}&orderId=${orderId}`
      );

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setConnectionStatus('connected');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setConnectionStatus('error');
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.error) {
          console.error('Message Error:', message.error);
          return;
        }
        setMessages(prev => {
          const messageExists = prev.some(m => m._id === message._id);
          return messageExists ? prev : [...prev, message];
        });
      };
    } catch (error) {
      console.error('Connection Error:', error);
      setConnectionStatus('error');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/history/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const formattedMessages = data.messages.map(message => ({
          ...message,
          senderId: message.sender._id,
          timestamp: message.createdAt || message.timestamp
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    fetchChatHistory();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId, orderId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (ws.current?.readyState !== WebSocket.OPEN) {
      console.log('Reconnecting...');
      connectWebSocket();
      return;
    }

    const messageData = {
      senderId: user._id,
      receiverId: userId,
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

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Chat with Customer</h3>
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
            const isSender = message.sender._id === user._id || message.senderId === user._id;
            return (
              <div
                key={message._id || index}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                {!isSender && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-gray-600">
                      {message.sender?.name?.charAt(0) || 'C'}
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
                      {user.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="text-center text-gray-500 text-sm py-4">
              Loading chat history...
            </div>
          )}
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