import React, { useState, useEffect } from 'react';
import './chatClient.css';
import io from 'socket.io-client';
// 1. importo Picker
import Picker from 'emoji-picker-react'

const socket = io('http://localhost:4000');
//const socket = io('https://chat-server-edwin-dev.onrender.com/');

export const ChatClient = () => {

  // Estado que controla el mensaje actual  
  const [message, setMessage] = useState('');
  const [username, setUserName] = useState('Admin');
  // 2. estado de control para emojis
  const [showPicker, setShowPicker] = useState(false);

  // 3. función que asigna el emoji
  const onEmojiClick = (emojiObject) => {
    setMessage(prevInput => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  // estado para controlar la lista de mensajes
  const [listMessages, setListMessages] = useState([{
    body: "Bienvenido a la sala de chat",
    user: "Admin",
  }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Para enviar, usaremos el evento emit, este enviará el mensaje por medio del socket
    // recibe dos parámetros: el primero es una cadena con el nombre del evento "message", y el segundo su valor
    socket.emit('message', { body: message, user: username });
    const newMsg = {
      body: message,
      user: username
    }
    setListMessages([...listMessages, newMsg]);
    setMessage('');
  }

  useEffect(() => {
    //Muestra por consola el mensaje que el backend me envía
    const receiveMessage = msg => {
      setListMessages([...listMessages, msg])
    }
    socket.on('message', receiveMessage);

    // Función que va a desuscribir el evento
    return () => socket.off('message', receiveMessage);
  }, [listMessages])


  return (
    <>
      <input onChange={event => setUserName(event.target.value)} className='txt-username' type="text" placeholder='Escribe su Nombre' />

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
  )
}        
