export default class User {
	constructor(socket) {
		this.socket = socket;
		this.actionHandlers = new Map();
	}

	SendMessage(type, data) {
		return this.socket.SendMessage(type, data);
	}

	SetActionHandler(type, handler) {
		this.actionHandlers.set(type, handler);
	}
	PerformAction(type, data) {
		this.actionHandlers.get(type)?.(data);
	}
}
