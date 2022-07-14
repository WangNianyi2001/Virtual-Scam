import { UserSocket, GetUserSocket } from '../user-socket.js';

class Audience extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('init', function(event) {
			this.SendMessage('init', { id: this.id });
		});
		this.addEventListener('fail', function(event) {
			const reason = event.data?.reason?.toString();
			throw new Error(`Failed to fetch user data: ${reason}`);
		});
	}
}

GetUserSocket(Audience);
