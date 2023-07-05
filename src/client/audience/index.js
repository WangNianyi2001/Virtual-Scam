import { Page } from '../ui.js';
import Cookies from '../js.cookie.min.mjs';
import { UserSocket, GetUserSocket, Validate } from '../user-socket.js';
import Audience from './audience.js';

let audience = null;

class AudienceSocket extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function() {
			this.SendCommand('respond-meta', { id: this.id, hostID: Cookies.get('hostID') });
		});
		this.addEventListener('init-data', function({ command }) {
			const { error, reason, data } = command.data;
			if(error) {
				document.getElementById('error').innerText = reason;
				throw new Error(reason);
			}
			audience = window.audience = this.user = new Audience(this, data);
			document.getElementById('user-id').innerText = audience.id;
			document.getElementById('host-id').innerText = audience.hostID;
			Cookies.set('hostID', audience.hostID);
			Page.Find('inbox').Show();
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

document.getElementById('transfer').addEventListener('click', function() {
	let amount = prompt('Amount of balance to transfer');
	if(amount === null)
		return;
	amount = +amount;
	if(isNaN(amount) || amount <= 0.01)
		return alert(`Not a valid amount`);
	audience.SetBalance(audience.balance - amount);
	alert('Transaction succeed');
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
