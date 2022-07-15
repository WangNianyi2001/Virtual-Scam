import { Page } from '../ui.js';
import Cookies from '../js.cookie.min.mjs';
import { UserSocket, GetUserSocket, Validate } from '../user-socket.js';
import Audience from './audience.js';

let audience = null;

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
			audience = new Audience(this);
			Page.Find('inbox').Show();
			audience.PerformAction('add-contact', { contact: 'Dad' });
			audience.PerformAction('receive-message', { contact: 'Dad', content: 'whatup son' });
			setTimeout(() => audience.PerformAction('remove-contact', { contact: 'Dad' }), 1000);
		});
	}
}

const $footer = document.querySelector('body>main>footer');
document.addEventListener('pagehide', function({ page }) {
	const $footerNav = $footer.querySelector(`*[data-page-nav=${page.name}]`);
	$footerNav?.classList.remove('active');
});
document.addEventListener('pageshow', function({ page }) {
	const $footerNav = $footer.querySelector(`*[data-page-nav=${page.name}]`);
	$footer.classList[$footerNav ? 'add' : 'remove']('visible');
	$footerNav?.classList.add('active');
});
document.addEventListener('messagechange', function() {
	const allRead = [...audience.contacts.values()].every(contact => contact.read);
	$footer.querySelector('*[data-page-nav=inbox]').classList[allRead ? 'remove' : 'add']('unread');
});

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
