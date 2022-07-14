import '../ui.js';
import Cookies from '../js.cookie.min.mjs';
import { UserSocket, GetUserSocket, Validate } from '../user-socket.js';

class Audience extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function() {
			this.SendMessage('respond-meta', { id: this.id, hostID: Cookies.get('hostID') });
		});
		this.addEventListener('init-data', function(event) {
			const { error, reason, data } = event.data;
			if(error) {
				document.getElementById('error').innerText = reason;
				throw new Error(reason);
			}
			document.getElementById('user-id').innerText = data.id;
			document.getElementById('host-id').innerText = data.host.id;
			Cookies.set('hostID', data.host.id);
		});
	}
}

(async () => {
	const $restore = document.getElementById('restore');
	const $join = document.getElementById('join');

	$restore.onclick = () => GetUserSocket(Audience, true);
	$join.onclick = () => {
		Cookies.set('hostID', document.getElementById('host-id-input').value);
		GetUserSocket(Audience);
	};

	if(!await Validate())
		$restore.setAttribute('disabled', '');
})();
