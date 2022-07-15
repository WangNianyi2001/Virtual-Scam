import Cookies from './js.cookie.min.mjs';

const userSocketURL = `ws://${new URL(location.href).host}/user/`;
export class UserSocket extends EventTarget {
	constructor(id) {
		super();
		this.id = id;
		this.socket = new WebSocket(userSocketURL);
		this.socket.onopen = this.OnOpen.bind(this);
		this.socket.onmessage = this.OnMessage.bind(this);
		this.socket.onclose = this.OnClose.bind(this);
	}

	OnOpen() {
		console.log('Opening socket');
	}

	OnMessage(ev) {
		const message = JSON.parse(ev.data);
		switch(message.type) {
			default:
				const event = new Event(message.type);
				event.message = message;
				this.dispatchEvent(event);
				break;
		}
	}

	OnClose() {
		console.log('Closing socket');
	}

	SendMessage(type, data = null) {
		this.socket.send(JSON.stringify({ type, data }));
	}
}

export async function UpdateTimestamp() {
	const timestamp = await (await fetch('/timestamp', { method: 'GET' })).text();
	Cookies.set('timestamp', timestamp);
	return timestamp;
}

export async function Validate() {
	if(!['id', 'timestamp'].every(k => typeof Cookies.get(k) === 'string'))
		return false;
	return !!JSON.parse(await (await fetch(
		`/validate?timestamp=${Cookies.get('timestamp')}`,
		{ method: 'GET' }
	)).text());
}

export async function GetUserID(validate = false) {
	if(validate && await Validate())
		return Cookies.get('id');
	await UpdateTimestamp();
	const id = await (await fetch(`/id`, { method: 'GET' })).text();
	Cookies.set('id', id);
	return id;
}

export async function GetUserSocket(Type, validate = false) {
	return new Type(await GetUserID(validate));
};

export async function TryLoginFromCookie(Type) {
	return await GetUserSocket(Type, true);
}
