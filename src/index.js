import config from '../config.js';
import express from 'express';
import expressWs from 'express-ws';
import { UserSocket } from './server/user-socket.js'

// Create app and later listen on the port
const app = express();
setTimeout(() => app.listen(config.port, function() {
	console.log(`Listening on http://localhost:${config.port}/`);
}));

// Statically serve frontend client
app.use(express.static('src/client/'));

// Client ID generator
let nextID = 0;
app.get('/id', function(req, res) {
	const id = nextID + '';
	++nextID;
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write(id);
	res.end();
});

// Web sockets
expressWs(app);
app.ws('/', async function(socket) {
	const userSocket = new UserSocket(socket);
	do await new Promise(res => setTimeout(res, 1000));
	while(userSocket.user);
});
