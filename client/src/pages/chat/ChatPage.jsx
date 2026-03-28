import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMessages } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_SERVER_URL } from '../../config/api.config';
import { PaperPlaneTilt } from 'phosphor-react';
import './ChatPage.css';

export default function ChatPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    // load history
    getMessages(bookingId).then(({ data }) => setMessages(data.messages)).catch(() => {});

    // socket connection
    const s = io(API_SERVER_URL, { withCredentials: true });
    s.emit('join_room', { bookingId });
    s.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    s.on('user_typing', () => setTyping(true));
    s.on('user_stop_typing', () => setTyping(false));
    setSocket(s);

    return () => {
      s.emit('leave_room', { bookingId });
      s.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send_message', {
      bookingId,
      senderId: user._id,
      content: input.trim(),
      messageType: 'text',
      senderName: user.name,
      senderImage: user.profileImage,
    });
    setInput('');
    socket.emit('stop_typing', { bookingId, userId: user._id });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit('typing', { bookingId, userId: user._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stop_typing', { bookingId, userId: user._id });
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header card">
          <h3 className="heading-sm">Chat</h3>
          <p className="text-small">Booking #{bookingId?.slice(-6)}</p>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => {
            const isMine = msg.senderId?._id === user._id || msg.senderId === user._id;
            return (
              <div key={msg._id || i} className={`message ${isMine ? 'mine' : 'theirs'}`}>
                <div className={`bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                  {!isMine && <span className="msg-sender">{msg.senderId?.name || 'User'}</span>}
                  <p>{msg.content}</p>
                  <span className="msg-time">{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="message theirs">
              <div className="bubble bubble-theirs typing-indicator"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar">
          <input
            className="input chat-input"
            placeholder="Type a message..."
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim()}>
            <PaperPlaneTilt size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
