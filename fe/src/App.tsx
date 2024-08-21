import React, { useEffect, useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

function App() {
  const [imageSrc, setImageSrc] = useState('');

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  useEffect(() => {
    socket.on('image-stream', (base64Image) => {
      const imageBlob = base64ToBlob(base64Image, 'image/webp');
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageSrc(imageUrl);

      return () => URL.revokeObjectURL(imageUrl);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  console.log('imagesrc : ', imageSrc);
  return (
    <div className="App">
      <h2>socket test1</h2>
      {imageSrc ? <img src={imageSrc} alt="stream" /> : <p>no image </p>}
    </div>
  );
}

export default App;
