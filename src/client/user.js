export default class User {
	constructor(socket) {
		this.socket = socket;
		this.actions = new Map();
	}

	SendCommand(type, data) {
		return this.socket.SendCommand(type, data);
	}

	SetAction(type, handler) {
		this.actions.set(type, handler);
	}
	PerformAction(type, data) {
		this.actions.get(type)?.call(this, data);
	}
	SendAction(type, data) {
		this.SendCommand('action', { type, data });
	}
}
