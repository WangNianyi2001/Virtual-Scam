import User from './user.js';
import Host from './host.js';

export default class Audience extends User {
	get host() {
		return User.Find(this.hostID);
	}

	constructor(id, hostID) {
		super(id);
		this.hostID = hostID;
		if(!(this.host instanceof Host))
			throw new ReferenceError('Requested host doesn\'t exist');
		this.host.audiencesID.add(this.id);
		this.balance = 0;
	}

	ChangeBalance(amount) {
		amount = +amount;
		if(isNaN(amount))
			return;
		this.balance += amount;
		this.SendAction('set-balance', this.balance);
		setTimeout(() => this.SystemAlert(
			`Your balance has changed to ${this.balance.toFixed(2)}`
		));
	}

	SystemAlert(message) {
		this.SendAction('system-alert', message);
	}

	Destroy() {
		this.host.audiencesID.delete(this.id);
		super.Destroy();
	}
};
