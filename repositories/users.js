const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
    async ComparePasswords(saved, supplied) {
        //saved -> password saved in our database. 'hashed.salt'
        //supplied -> password given to us by a user trying to sign in
        const [hashed, salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuf.toString('hex');//scrypt returns a buffer so it is converted tostring
    }

    async create(attrs) {
        attrs.id = this.randomId();
        //{email: 'djivjd@fjdjk.com', password: 'password'}
        
        const salt = crypto.randomBytes(8).toString('hex');
        const buf = await scrypt(attrs.password, salt, 64);

        const records = await this.getAll();
        const record = {
            ...attrs, 
            password: `${buf.toString('hex')}.${salt}`
        };
        records.push(record);
        
        await this.writeAll(records);

        return record;
    }

}

module.exports = new UsersRepository('users.json');