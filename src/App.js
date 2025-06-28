const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

module.exports = function(SERVER_PORT) {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // Armazenamento de salas
  const rooms = {};

  wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      const data = JSON.parse(message);
      const room = data.room;

      if (!rooms[room]) rooms[room] = [];
      if (!rooms[room].includes(ws)) rooms[room].push(ws);

      rooms[room].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    });

    ws.on('close', () => {
      for (const room in rooms) {
        rooms[room] = rooms[room].filter(client => client !== ws);
      }
    });
  });

  // Servir arquivos estáticos do frontend
  app.use(express.static(path.join(__dirname, '..', 'public')));

  return {
    start: () => {
      server.listen(SERVER_PORT, () => {
        console.log(`Servidor rodando na porta ${SERVER_PORT}`);
      });
    }
  };
};
