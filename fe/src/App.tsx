import React, { useEffect, useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

function App() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    socket.on('image-stream', (base64Image) => {
      setImageSrc(`data:image/jpeg;base64,${base64Image}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h2>socket test</h2>
      {imageSrc ? <img src={imageSrc} alt="stream" /> : <p>no image </p>}
    </div>
  );
}

export default App;
