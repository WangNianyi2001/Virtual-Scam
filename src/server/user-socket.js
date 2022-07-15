import { User, Host, Audience } from "./user.js";
import EventEmitter from "events";
import Serialize from '../serialize.js';

export const userSocket = new WeakMap();
export const socketUser = new WeakMap();

export class UserSocket extends EventEmitter {
	constructor(ws) {
		super();
		this.ws = ws;
		if(this.ws.readyState === 0)
			this.ws.onopen = this.OnOpen.bind(this);
		else
			setTimeout(this.OnOpen.bind(this));
		this.ws.onmessage = this.OnCommand.bind(this);
		this.ws.onclose = this.OnClose.bind(this);
		this.user = null;
		this.on('respond-meta', this.OnRespondMeta.bind(this));
	}

	OnOpen() {
		this.SendCommand('fetch-meta');
	}

	OnRespondMeta(data) {
		const nextMessageType = 'init-data';
		const fail = reason => this.SendCommand(
			nextMessageType,
			{ error: true, reason }
		);
		const { id, hostID } = data;
		const targetType = hostID === null ? Host : Audience;
		let targetUser = User.Find(id);
		if(!targetUser) {
			try {
				targetUser = new targetType(id, hostID);
			} catch(e) {
				return fail(e.toString());
			}
		} else {
			if(!(targetUser instanceof targetType))
				return fail('User type doesn\'t match');
			if(targetUser instanceof Audience) {
				if(targetUser.host?.id !== hostID)
					return fail('Host ID doesn\'t match');
			}
		}
		this.user = targetUser;
		userSocket.set(this.user, this);
		socketUser.set(this, this.user);
		this.user.emit('connect', this);
		this.SendCommand(nextMessageType, {
			error: false,
			data: targetUser
		});
	}

	OnCommand(ev) {
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
		this.ws.close();
	}

	SendCommand(type, data = null) {
		const content = Serialize({ type, data });
		this.ws.send(content);
	}
}
