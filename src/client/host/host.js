import { Control, Page } from '../ui.js';
import User from '../user.js';

export default class Host extends User {
	constructor(socket, data) {
		super(socket);
		this.id = data.id;
	}

	BroadcastAction(type, data) {
		this.SendAction('broadcast-action', { type, data });
	}
}
