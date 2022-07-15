import { Control, Page } from '../ui.js';
import User from '../user.js';

class Contact {
	constructor(name) {
		this.name = name;
		this.messages = [];
		this.read = true;

		const $ = document.createElement('div');
		$.classList.add('entry');
		$.innerHTML = `
			<h3>${this.name}</h3>
			<p class="content"></p>
		`;
		this.chat = new Control($);
		this.$content = this.chat.$.querySelector('.content');
		document.querySelector('#inbox>main').append(this.chat.$);
		this.chat.$.addEventListener('click', this.ViewMessage.bind(this));
	}

	Destroy() {
		this.SetRead();
		this.chat.Destroy();
	}

	SetRead(read = true) {
		this.chat.$.classList[read ? 'remove' : 'add']('unread');
		this.read = read;
		const event = new Event('messagechange');
		event.contact = this;
		document.dispatchEvent(event);
	}

	AddMessage(content, self) {
		this.messages.push({ content, self });
		this.$content.innerText = content;
		this.SetRead(false);
	}

	ViewMessage() {
		const page = Page.Find('message');
		page.$.querySelector('header>.title').innerText = this.name;
		page.Show();
		this.SetRead();
	}
}

export default class Audience extends User {
	constructor(socket) {
		super(socket);
		this.contacts = new Map();
		this.SetActionHandler('add-contact', ({ contact }) => this.AddContact(contact));
		this.SetActionHandler('remove-contact', ({ contact }) => this.RemoveContact(contact));
		this.SetActionHandler('receive-message', ({ contact, content }) => this.ReceiveMessage(contact, content));
	}

	AddContact(contact) {
		if(!(contact instanceof Contact))
			contact = new Contact(contact);
		this.contacts.set(contact.name, contact);
	}

	RemoveContact(contact) {
		if(!(contact instanceof Contact))
			contact = this.contacts.get(contact);
		if(!(contact instanceof Contact))
			return;
		contact.Destroy();
		this.contacts.delete(contact);
	}

	ReceiveMessage(contact, content) {
		if(!(contact instanceof Contact))
			contact = this.contacts.get(contact);
		if(!(contact instanceof Contact))
			return;
		contact.AddMessage(content, false);
	}
}
