import { URL } from 'url'; // in Browser, the URL in native accessible on window

const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;

export default {
	__dirname, __filename,
	port: 8080,
};
