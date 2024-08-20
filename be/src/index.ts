import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 8000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // 리액트 앱 주소
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

io.on('connection', (socket) => {
  console.log('User connected!');

  let imageIndex = 0;
  const totalImages = 100; // 0p00 ~ 0p99까지 이미지 수
  const imageDir = 'C:/aipro/data/chimgs/now';

  // 이미지 전송 함수
  const sendImage = () => {
    const paddedIndex = imageIndex.toString().padStart(2, '0');
    const imagePath = path.join(imageDir, `0p${paddedIndex}.jpg`);
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error('Error reading image file:', err);
        return;
      }
      console.log(imagePath);
      const base64Image = data.toString('base64');
      socket.emit('image-stream', base64Image);

      imageIndex = (imageIndex + 1) % totalImages; // 다음 이미지로 인덱스 증가
    });
  };

  // 일정 간격으로 이미지를 전송 (예: 1초당 10장)
  const intervalId = setInterval(sendImage, 100);

  socket.on('disconnect', () => {
    console.log('User disconnected!');
    clearInterval(intervalId); // 클라이언트가 연결 해제되면 반복 멈춤
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
