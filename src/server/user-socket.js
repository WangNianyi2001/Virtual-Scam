import EventEmitter from "events";

const userSocket = new WeakMap();
const socketUser = new WeakMap();
const users = new WeakMap();

export class User extends EventEmitter {
	get socket() {
		return userSocket.get(this) || null;
	}

	constructor(id) {
		this.id = id + '';
		users.set(this.id, this);
	}

	SendMessage(type, data = null) {
		this.socket?.SendMessage(type, data);
	}

	Destroy() {
		this.socket?.Destroy();
		users.delete(this.ids);
	}
}
User.Find = function(id) {
	return users.get(id + '') || null;
}

export class UserSocket {
	constructor(socket) {
		this.socket = socket;
		if(this.socket.readyState === 0)
			this.socket.onopen = this.OnOpen.bind(this);
		else
			setTimeout(this.OnOpen.bind(this));
		this.socket.onmessage = this.OnMessage.bind(this);
		this.socket.onclose = this.OnClose.bind(this);
		this.user = null;
	}

	OnOpen() {
		this.SendMessage('init');
	}

	OnMessage(ev) {
		const { type, data } = JSON.parse(ev.data);
		switch(type) {
			case 'init':
				const user = User.Find(data.id);
				if(!user) {
					this.SendMessage('fail', { 'reason': 'User not found' });
					this.Destroy();
					return;
				}
				this.user = user;
				userSocket.set(this.user, this);
				socketUser.set(this, this.user);
				this.user.emit('connect', this);
				break;
			default:
				this.user?.emit(type, data);
				break;
		}
	}

	OnClose() {
		this.Destroy();
	}

	Destroy() {
		if(this.user) {
			this.user.emit('disconnect');
			userSocket.delete(this.user);
			socketUser.delete(this);
		}
		this.socket.close();
	}

	SendMessage(type, data = null) {
		const content = JSON.stringify({ type, data });
		this.socket.send(content);
	}
}
