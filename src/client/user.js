export default class User {
	constructor(socket) {
		this.socket = socket;
	}

	on(type, handler, once = false) {
		this.socket.addEventListener(
			type,
			({ message }) => handler(message),
			{ once }
		);
	}

	once(type, handler) {
		this.on(type, handler, true);
	}

	SendMessage(type, data) {
		return this.socket.SendMessage(type, data);
	}
}
