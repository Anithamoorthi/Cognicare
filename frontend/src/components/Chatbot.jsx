import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am CogniCare. How can I help you today?' }]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://cognicare-1-lxfi.onrender.com/api/chat/message', { message: userMsg }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Connection error. Please ensure the backend is running and the API key is valid.' }]);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-bot-avatar">🤖</div>
        <div className="chat-bot-info">
          <div className="chat-bot-name">CogniCare Assistant</div>
          <div className="chat-bot-status">Online</div>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.sender}`}>
            {m.sender === 'bot' && <div className="msg-avatar">🤖</div>}
            <div className="msg-bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <div className="chat-send-btn" onClick={handleSend}>➤</div>
      </div>
    </div>
  );
};

export default Chatbot;
