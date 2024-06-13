import React, { useState, useEffect } from 'react';
import './chatClient.css';
import io from 'socket.io-client';
import Picker from 'emoji-picker-react';

//const socket = io('http://localhost:4000');
const socket = io('https://q-hubochat-server.onrender.com');

export const ChatClient = () => {
  const [message, setMessage] = useState('');
  const [username, setUserName] = useState('');
  const [confirmedUsername, setConfirmedUsername] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [listMessages, setListMessages] = useState([{
    body: "Bienvenido a la sala de chat",
    user: "Admin",
  }]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const onEmojiClick = (emojiObject) => {
    setMessage(prevInput => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('message', { body: message, user: confirmedUsername });
    const newMsg = {
      body: message,
      user: confirmedUsername
    };
    setListMessages([...listMessages, newMsg]);
    setMessage('');
  };

  const confirmUsername = () => {
    if (username.trim()) {
      setConfirmedUsername(username);
      socket.emit('userConnected', username);
    }
  };

  useEffect(() => {
    const receiveMessage = msg => {
      setListMessages([...listMessages, msg]);
    };
    socket.on('message', receiveMessage);

    const updateOnlineUsers = users => {
      setOnlineUsers(users);
    };
    socket.on('users', updateOnlineUsers);

    return () => {
      socket.off('message', receiveMessage);
      socket.off('users', updateOnlineUsers);
    };
  }, [listMessages]);

  return (
    <>
      {!confirmedUsername ? (
        <div className="username-container" style={{ backgroundImage: "url(https://cdn.kometia-static.com/blog/2017/11/06182228/chatbots.jpg)", backgroundSize: 'cover', backgroundPosition: 'center', padding: '2rem', borderRadius: '16px' }}>
          <input
            onChange={event => setUserName(event.target.value)}
            className='txt-username'
            type="text"
            placeholder='Escribe su Alias'
          />
          <button onClick={confirmUsername}>Confirmar Alias</button>
        </div>
      ) : (
        <>
          <div className="div-online-users">
            <h3>Usuarios en línea:</h3>
            <ul>
              {onlineUsers.map((user, idx) => (
                <li key={user + idx}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="div-chat">
            {listMessages.map((message, idx) => (
              <p
                key={message + idx}
                className={message.user === 'Máquina' ? 'user-machine' : 'user-other'}
              >
                {message.user}: {message.body}
              </p>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="form">
            <span className="title">Escribe tu mensaje</span>
            <div className='div-type-chat'>
              <img
                className="emoji-icon"
                src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
                onClick={() => setShowPicker(!showPicker)} />
              {showPicker && <Picker className="prueba" onEmojiClick={onEmojiClick} />}
              <input
                value={message}
                placeholder="Escribe tu mensaje"
                onChange={e => setMessage(e.target.value)}
                type="text" name="text" id="chat-message"
                className="input-style"
              />
              <button type="submit">Enviar</button>
            </div>
          </form>
        </>
      )}
    </>
  );
};
