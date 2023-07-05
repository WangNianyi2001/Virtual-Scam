import config from '../config.js';
import express from 'express';
import expressWs from 'express-ws';
import { UserSocket } from './server/user-socket.js'
import { URL } from 'url';

// Create app and later listen on the port
const app = express();
setTimeout(() => app.listen(config.port, function() {
	console.log(`Listening on http://localhost:${config.port}/`);
}));

// Statically serve frontend client
app.use(express.static('client/'));

// Timestamp validation
const timestamp = +new Date() + '';
app.get('/timestamp', function(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write(timestamp);
	res.end();
});
app.get('/validate', function(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/json' });
	const sp = new URL(`http://a.com${req.originalUrl}`).searchParams;
	res.write(sp.get('timestamp') === timestamp ? 'true' : 'false');
	res.end();
});

// ID generator
let nextID = 0;
app.get('/id', function(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	const id = nextID + '';
	++nextID;
	res.write(id);
	res.end();
});

// Web sockets
expressWs(app);
app.ws('/user', async function(socket) {
	const userSocket = new UserSocket(socket);
	do await new Promise(res => setTimeout(res, 1000));
	while(userSocket.user);
});
