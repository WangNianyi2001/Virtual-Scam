export default class User {
	constructor(socket) {
		this.socket = socket;
		this.actions = new Map();
	}

	SetAction(type, handler) {
		this.actions.set(type, handler);
	}
	PerformAction(type, data) {
		this.actions.get(type)?.call(this, data);
	}
	SendAction(type, data) {
		this.socket.SendCommand('action', { type, data });
	}
}
