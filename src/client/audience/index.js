import { Page } from '../ui.js';
import Cookies from '../js.cookie.min.mjs';
import { UserSocket, GetUserSocket, Validate } from '../user-socket.js';
import Audience from './audience.js';

class AudienceSocket extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function() {
			this.SendMessage('respond-meta', { id: this.id, hostID: Cookies.get('hostID') });
		});
		this.addEventListener('init-data', function({ message }) {
			const { error, reason, data } = message.data;
			if(error) {
				document.getElementById('error').innerText = reason;
				throw new Error(reason);
			}
			document.getElementById('user-id').innerText = data.id;
			document.getElementById('host-id').innerText = data.host.id;
			Cookies.set('hostID', data.host.id);
			new Audience(this);
		});
	}
}

for(const page of Page.pages) {
	page.addEventListener('pagechoose', function(ev) {
		document.querySelector('.active[data-page-nav]')?.classList.remove('active');
		document.querySelector(`*[data-page-nav=${ev.page.name}]`)?.classList.add('active');
	});
}

(async () => {
	const $restore = document.getElementById('restore');
	const $join = document.getElementById('join');

	$restore.onclick = () => GetUserSocket(AudienceSocket, true);
	$join.onclick = () => {
		Cookies.set('hostID', document.getElementById('host-id-input').value);
		GetUserSocket(AudienceSocket);
	};

	if(!await Validate())
		$restore.setAttribute('disabled', '');
	else
		GetUserSocket(AudienceSocket, true);
})();
