import EventEmitter from "events";

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
	}

	SendMessage(type, data = null) {
		this.socket?.SendMessage(type, data);
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
	constructor(id) {
		super(id);
		this.audiences = new Set();
	}
};

export class Audience extends User {
	constructor(id, hostID) {
		let host = User.Find(hostID);
		if(!(host instanceof Host))
			throw new ReferenceError('Requested host doesn\'t exist');
		super(id);
		this.host = host;
		this.host.audiences.add(this);
	}

	Destroy() {
		this.host.audiences.delete(this);
		super.Destroy();
	}
};
