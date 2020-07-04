const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
	async create(attrs) {
		attrs.id = this.randomID();

		const salt = crypto.randomBytes(8).toString('hex');
		const buf = await scrypt(attrs.password, salt, 64);

		const records = await this.getAll();
		const record = {
			...attrs,
			password : `${buf.toString('hex')}.${salt}`
		};
		records.push(record);

		await this.writeAll(records);

		return record;
	}

	async comparePasswords(saved, supplied) {
		// saved is password saved in database => 'hashed.salt'
		// supplied is password given by user
		// const result = saved.split('.');
		// const hashed = result[0];
		// const salt = result[1];
		const [
			hashed,
			salt
		] = saved.split('.');
		const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

		return hashed === hashedSuppliedBuf.toString('hex');
	}
}

module.exports = new UsersRepository('users.json');
