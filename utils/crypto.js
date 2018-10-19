/**
* Requiring crypto for generating unique id and signing and unsiging the ids.
*/
const crypto=require('crypto');


class Crypt {
	generateId(len){
		/**
		* Generating unique id by randomBytes.
		*/
		let id=crypto.randomBytes(Math.ceil(len * 3 / 4))
			.toString('base64')
			.slice(0, len)
			.replace(/\//g, '-')
			.replace(/\+/g, '_');

		return id;
	}
}

module.exports = new Crypt()
