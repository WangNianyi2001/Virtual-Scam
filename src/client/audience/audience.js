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
		$.addEventListener('click', this.ViewMessage.bind(this));
		this.chat = new Control($);
		this.$content = this.chat.$.querySelector('.content');
		document.querySelector('#inbox>main').append(this.chat.$);
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
		if(Contact.current === this)
			this.ViewMessage();
	}

	ViewMessage() {
		Contact.current = this;
		const event = new Event('messageview');
		event.contact = this;
		document.dispatchEvent(event);

		const page = Page.Find('message');

		page.$.querySelector('header>.title').innerText = this.name;

		page.$.querySelector('.history').innerHTML = this.messages
			.slice().reverse()
			.map(m => `<li>
				<span class="sender">${m.self ? 'Me' : this.name}</span>
				<span class="content">${m.content}</span>
			</li>`).join('\n');

		page.Show();
		this.SetRead();
	}
}
Contact.current = null;
document.addEventListener('pageshow', ({page}) => {
	if(page.name !== 'message')
		Contact.current = null;
});
document.getElementById('send').addEventListener('click', () => {
	const $input = document.getElementById('input');
	const content = $input.value;
	Contact.current?.AddMessage(content, true);
	$input.value = '';
});

export default class Audience extends User {
	constructor(socket, data) {
		super(socket);
		this.contacts = new Map();
		this.id = data.id;
		this.hostID = data.hostID;
		this.SetBalance(+data.balance);

		this.SetAction('add-contact', function({ name }) {
			this.AddContact(name);
		});
		this.SetAction('remove-contact', function({ name }) {
			if(!this.contacts.has(name))
				return;
			const contact = this.GetContact(name);
			contact.Destroy();
			this.contacts.delete(contact);
		});
		this.SetAction('receive-message', function({ name, content }) {
			this.GetContact(name).AddMessage(content, false);
		});
		this.SetAction('set-balance', function(amount) {
			amount = +amount;
			if(isNaN(amount))
				return;
			this.SetBalance(amount);
		});
		this.SetAction('system-alert', function(message) {
			alert(message);
		});
	}

	AddContact(name) {
		if(this.contacts.has(name))
			return;
		let contact = new Contact(name);
		this.contacts.set(name, contact);
	}

	GetContact(name) {
		let contact = this.contacts.get(name);
		if(contact)
			return contact;
		contact = new Contact(name);
		this.contacts.set(name, contact);
		return contact;
	}

	SetBalance(amount) {
		this.balance = amount;
		document.getElementById('balance').innerText = amount.toFixed(2);
	}
}
