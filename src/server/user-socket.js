import { User, Host, Audience } from "./user.js";
import EventEmitter from "events";

const userSocket = new WeakMap();
const socketUser = new WeakMap();

export class UserSocket extends EventEmitter {
	constructor(socket) {
		super();
		this.socket = socket;
		if(this.socket.readyState === 0)
			this.socket.onopen = this.OnOpen.bind(this);
		else
			setTimeout(this.OnOpen.bind(this));
		this.socket.onmessage = this.OnMessage.bind(this);
		this.socket.onclose = this.OnClose.bind(this);
		this.user = null;
		this.on('respond-meta', this.OnRespondMeta.bind(this));
	}

	OnOpen() {
		this.SendMessage('fetch-meta');
	}

	OnRespondMeta(data) {
		const nextMessageType = 'init-data';
		const fail = reason => this.SendMessage(
			nextMessageType,
			{ error: true, reason }
		);
		const { id, hostID } = data;
		const targetType = hostID === null ? Host : Audience;
		let target = User.Find(id);
		if(!target) {
			try {
				target = new targetType(id, hostID);
			} catch(e) {
				return fail(e.toString());
			}
		} else {
			if(!(target instanceof targetType))
				return fail('User type doesn\'t match');
			if(target instanceof Audience && target.host?.id !== hostID)
				return fail('Host ID doesn\'t match');
		}
		this.user = target;
		userSocket.set(this.user, this);
		socketUser.set(this, this.user);
		this.user.emit('connect', this);
		this.SendMessage(nextMessageType, {
			error: false,
			data: target
		});
	}

	OnMessage(ev) {
		const { type, data } = JSON.parse(ev.data);
		(this.user || this).emit(type, data);
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
