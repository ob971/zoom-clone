const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const io =require('socket.io')(server);
app.set('view engine', 'ejs');
app.use(express.static('public'));



app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });

});













server.listen(5030, () => {
  console.log('Server is running on port 5030');
});
