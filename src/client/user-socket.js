import Cookies from './js.cookie.min.mjs';

const userSocketURL = `ws://${new URL(location.href).host}/user/`;
export class UserSocket extends EventTarget {
	constructor(id) {
		super();
		this.id = id;
		this.ws = new WebSocket(userSocketURL);
		this.ws.onopen = this.OnOpen.bind(this);
		this.ws.onmessage = this.OnCommand.bind(this);
		this.ws.onclose = this.OnClose.bind(this);
		this.user = null;
	}

	OnOpen() {
		console.log('Opening socket');
	}

	OnCommand(ev) {
		const command = JSON.parse(ev.data);
		switch(command.type) {
			case 'action':
				const { type, data } = command.data;
				this.user?.PerformAction(type, data);
			default:
				const event = new Event(command.type);
				event.command = command;
				this.dispatchEvent(event);
				break
		}
	}

	OnClose() {
		console.log('Closing socket');
	}

	SendCommand(type, data = null) {
		this.ws.send(JSON.stringify({ type, data }));
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
