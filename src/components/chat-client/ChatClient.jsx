import React, { useState, useEffect } from 'react';
import './chatClient.css';
import io from 'socket.io-client';
import Picker from 'emoji-picker-react';

//const socket = io('http://localhost:4000');
const socket = io('https://q-hubochat-server.onrender.com');
const avatars = [
  'https://res.cloudinary.com/dybws2ubw/image/upload/v1718294095/Avatar-1_vwj2k1.png',
  'https://res.cloudinary.com/dybws2ubw/image/upload/v1718294444/avatar-3_tahjmi.jpg',
  'https://res.cloudinary.com/dybws2ubw/image/upload/v1718294444/avatar-4_ctvbxa.png',
  'https://res.cloudinary.com/dybws2ubw/image/upload/v1718294444/avatar-5_i2tasd.png',
  'https://res.cloudinary.com/dybws2ubw/image/upload/v1718294443/avatar-6_ugldj0.jpg',
  'https://res.cloudinary.com/dybws2ubw/image/upload/v1718294445/avatar-2_vtankk.png',
];
export const ChatClient = () => {
  const [message, setMessage] = useState('');
  const [username, setUserName] = useState('');
  const [confirmedUsername, setConfirmedUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [listMessages, setListMessages] = useState([{
    body: "Bienvenido a la sala de chat",
    user: "Admin",
    avatar: "https://res.cloudinary.com/dybws2ubw/image/upload/v1718295429/avatar-admin_dkbs4f.avif"
  }]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const onEmojiClick = (emojiObject) => {
    setMessage(prevInput => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('message', { body: message, user: confirmedUsername, avatar });
    const newMsg = {
      body: message,
      user: confirmedUsername,
      avatar
    };
    setListMessages([...listMessages, newMsg]);
    setMessage('');
  };

  const confirmUsername = () => {
    if (username.trim()) {
      setConfirmedUsername(username);
      socket.emit('userConnected', { username, avatar });
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
        <div className="username-container">
          <input
            onChange={event => setUserName(event.target.value)}
            className='txt-username'
            type="text"
            placeholder='Escribe su Alias'
          />
          <div className="avatar-selection">
            {avatars.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Avatar ${idx + 1}`}
                className={`avatar ${avatar === url ? 'selected' : ''}`}
                onClick={() => setAvatar(url)}
              />
            ))}
          </div>
          <button onClick={confirmUsername}>Ingresar</button>
        </div>
      ) : (
        <>
          <div className="div-online-users">
            <h3>Usuarios en línea:</h3>
            <ul>
              {onlineUsers.map((user, idx) => (
                <li key={user.username + idx}>
                  <img src={user.avatar} alt="avatar" className="user-avatar" />
                  {user.username}
                </li>
              ))}
            </ul>
          </div>

          <div className="div-chat">
            {listMessages.map((message, idx) => (
              <p
                key={message.body + idx}
                className={message.user === 'Máquina' ? 'user-machine' : 'user-other'}
              >
                <img src={message.avatar} alt="Avatar" className="avatar" />
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