import User from './user.js';

export default class Host extends User {
	get audiences() {
		return new Set([...this.audiencesID].map(id => User.Find(id)));
	}

	constructor(id) {
		super(id);
		this.audiencesID = new Set();

		this.SetAction('broadcast-action', function({ type, data }) {
			for(const audience of this.audiences)
				audience.SendAction(type, data);
		});

		this.SetAction('change-balance', function({ accountID, amount }) {
			User.Find(accountID)?.ChangeBalance?.(amount);
		});

		this.SetAction('system-alert', function({ accountID, message }) {
			User.Find(accountID)?.SystemAlert?.(message);
		});
	}
};
