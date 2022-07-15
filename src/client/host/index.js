import Host from './host.js';
import { Control, Page } from '../ui.js';
import { UserSocket, Validate, GetUserSocket } from '../user-socket.js';

let host = null;

class HostSocket extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function() {
			this.SendCommand('respond-meta', { id: this.id, hostID: null });
		});
		this.addEventListener('init-data', function({ command }) {
			const { error, reason, data } = command.data;
			if(error) {
				Page.Find('creation').$.getElementById('error').innerText = reason;
				throw new Error(reason);
			}
			host = window.host = this.user = new Host(this, data);
			document.getElementById('user-id').innerText = host.id;
			Page.Find('created').Show();
		});
	}
}

(async () => {
	const $restore = document.getElementById('restore');
	const $create = document.getElementById('create');

	$restore.onclick = () => GetUserSocket(HostSocket, true);
	$create.onclick = () => GetUserSocket(HostSocket);

	if(!await Validate())
		$restore.setAttribute('disabled', '');
})();
