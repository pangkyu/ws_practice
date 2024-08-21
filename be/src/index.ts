import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // sharp 라이브러리 임포트

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

  let currentIndex = 0;
  const imageDir = 'C:/aipro/data/chimgs/now';
  let validIndices: number[] = [];

  const updateIndices = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.readdir(imageDir, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return reject(err);
        }

        validIndices = files
          .filter((file) => file.startsWith('0p') && file.endsWith('.jpg'))
          .map((file) => parseInt(file.slice(2, 5)))
          .filter((num) => !isNaN(num))
          .sort((a, b) => a - b);

        if (validIndices.length === 0) {
          console.log('No images found.');
          return reject(new Error('No images found.'));
        }

        // 현재 인덱스가 유효하지 않으면 가장 작은 인덱스로 초기화
        if (!validIndices.includes(currentIndex)) {
          currentIndex = validIndices[0];
        }

        resolve();
      });
    });
  };

  const sendImage = () => {
    if (validIndices.length === 0) {
      console.log('No valid images to send.');
      return;
    }

    const paddedIndex = currentIndex.toString().padStart(3, '0');
    const imagePath = path.join(imageDir, `0p${paddedIndex}.jpg`);

    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error('Error reading image file:', err);
        return;
      }

      console.log(imagePath);

      // sharp 라이브러리로 jpg 이미지를 webp로 변환
      sharp(data)
        .webp({ quality: 80 })
        .toBuffer()
        .then((webpData) => {
          const base64Image = webpData.toString('base64');
          socket.emit('image-stream', base64Image);

          // 다음 유효한 인덱스로 이동
          const currentIdxInArray = validIndices.indexOf(currentIndex);
          currentIndex = validIndices[(currentIdxInArray + 1) % validIndices.length];
        })
        .catch((err) => {
          console.error('Error converting image to webp:', err);
        });
    });
  };

  // 최초 시작 시 인덱스 설정
  updateIndices()
    .then(() => {
      // 이미지 전송 주기 설정 (부스트 온)
      const intervalId = setInterval(() => {
        updateIndices().then(sendImage);
      }, 100);

      // 이미지 전송 주기 설정 (부스트 온)
      // const intervalId = setInterval(() => {
      //   updateIndices().then(sendImage);
      // }, 200);

      socket.on('disconnect', () => {
        console.log('User disconnected!');
        clearInterval(intervalId);
      });
    })
    .catch((err) => {
      console.error('Failed to start:', err);
    });
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
