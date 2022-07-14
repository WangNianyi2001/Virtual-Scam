import { Control, Page } from '../ui.js';
import { UserSocket, Validate, GetUserSocket } from '../user-socket.js';

class Host extends UserSocket {
	constructor() {
		super(...arguments);
		this.addEventListener('fetch-meta', function() {
			this.SendMessage('respond-meta', { id: this.id, hostID: null });
		});
		this.addEventListener('init-data', function(event) {
			const { error, reason, data } = event.data;
			console.log(event.data);
			if(error) {
				Page.Find('creation').$.getElementById('error').innerText = reason;
				throw new Error(reason);
			}
			Page.Find('created').Show();
			document.getElementById('user-id').innerText = data.id;
		});
	}
}

(async () => {
	const $restore = document.getElementById('restore-previous-session');
	const $create = document.getElementById('create-new-host');

	$restore.onclick = () => GetUserSocket(Host, true);
	$create.onclick = () => GetUserSocket(Host);

	if(!await Validate())
		$restore.setAttribute('disabled', '');
})();
