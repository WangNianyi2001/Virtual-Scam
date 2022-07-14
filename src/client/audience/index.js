import { UserSocket, GetUserSocket } from '../user-socket.js';

class Audience extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function(event) {
			this.SendMessage('respond-meta', { id: this.id, hostID: '1' });
		});
		this.addEventListener('init-data', function(event) {
			const { error, reason, data } = event;
			if(error)
				throw new Error(reason);
			console.log(data);
		});
	}
}

GetUserSocket(Audience);
