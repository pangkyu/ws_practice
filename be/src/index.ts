import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

const app = express();
const port = 8000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['get', 'post'],
  },
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

io.on('connection', (socket) => {
  console.log('connected!');

  socket.on('request-image', () => {
    const imagePath = 'C:aiprodatachimgs\now\0p00.jpg';
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error('Error reading image file : ', err);
        return;
      }

      const base64Image = data.toString('base64');
      socket.emit('image-stream', base64Image);
    });
  });

  socket.on('disconnect', () => {
    console.log('disconnected!');
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
