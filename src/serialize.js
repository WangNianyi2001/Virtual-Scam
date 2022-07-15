export default function Serialize(obj) {
	if(!(obj instanceof Object) || obj === null) {
		if(obj === null || obj === undefined)
			return 'null';
		return JSON.stringify(obj);
	}
	const kv = [];
	for(const key of Object.getOwnPropertyNames(obj)) {
		const first = key[0];
		if(['.', '#', '_'].includes(first))
			continue;
		kv.push([key, Serialize(obj[key])]);
	}
	return `{${kv.map(([k, v]) => `"${k}": ${v}`).join(',')}}`;
};
