import Cookies from './js.cookie.min.mjs';

const userSocketURL = `ws://${new URL(location.href).host}/`;
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
		const { type, data } = JSON.parse(ev.data);
		switch(type) {
			default:
				const event = new Event(type);
				event.data = data;
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

const userIDCookieKey = 'user-id';
async function GetUserID() {
	const inCookie = Cookies.get(userIDCookieKey);
	if(inCookie !== undefined)
		return inCookie;
	const fetched = await (await fetch('/id', { method: 'GET' })).text();
	Cookies.set(userIDCookieKey, fetched);
	return fetched;
}

export async function GetUserSocket(Type) {
	return new Type(await GetUserID());
};
