import EventEmitter from "events";
import { userSocket } from "./user-socket.js";

export const users = new Map();

export class User extends EventEmitter {
	get socket() {
		return userSocket.get(this) || null;
	}

	constructor(id) {
		super();
		if(User.Find(id))
			throw new ReferenceError(`User with ID ${id} already exists`);
		this.id = id + '';
		users.set(this.id, this);
		this.actions = new Map();
		this.on('action', ({ type, data }) => this.PerformAction(type, data));
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

	Destroy() {
		this.socket?.Destroy();
		users.delete(this.ids);
	}
};

User.Find = function(id) {
	return users.get(id + '') || null;
};

export class Host extends User {
	get audiences() {
		return new Set([...this.audiencesID].map(id => User.Find(id)));
	}

	constructor(id) {
		super(id);
		this.audiencesID = new Set();

		this.SetAction('broadcast-action', function({ type, data }) {
			for(const audience of this.audiences)
				audience.SendAction(type, data);
		});
	}
};

export class Audience extends User {
	get host() {
		return User.Find(this.hostID);
	}

	constructor(id, hostID) {
		super(id);
		this.hostID = hostID;
		if(!(this.host instanceof Host))
			throw new ReferenceError('Requested host doesn\'t exist');
		this.host.audiencesID.add(this.id);
	}

	Destroy() {
		this.host.audiencesID.delete(this.id);
		super.Destroy();
	}
};
