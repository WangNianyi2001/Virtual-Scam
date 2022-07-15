import { Page } from '../ui.js';
import User from '../user.js';

export default class Audience extends User {
	constructor(socket) {
		super(socket);
		Page.Find('message').Show();
	}
}
