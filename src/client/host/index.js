import { Control, Page } from '../ui.js';
import { UserSocket, Validate, GetUserSocket } from '../user-socket.js';

class Host extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function() {
			this.SendMessage('respond-meta', { id: this.id, hostID: null });
		});
		this.addEventListener('init-data', function({ message }) {
			const { error, reason, data } = message.data;
			if(error) {
				Page.Find('creation').$.getElementById('error').innerText = reason;
				throw new Error(reason);
			}
			document.getElementById('user-id').innerText = data.id;
			Page.Find('created').Show();
		});
	}
}

(async () => {
	const $restore = document.getElementById('restore');
	const $create = document.getElementById('create');

	$restore.onclick = () => GetUserSocket(Host, true);
	$create.onclick = () => GetUserSocket(Host);

	if(!await Validate())
		$restore.setAttribute('disabled', '');
})();
