const fs = require('fs');
const crypto = require('crypto');  //It is used for storing the data in encrypted form. It is used for authentication.

module.exports = class Repository {
    constructor(filename) {
        if (!filename) {
            throw new Error ('Creating a repository requires a filename');
        }

        this.filename = filename;
        //We can't have async code inside the constructor
        try {
            fs.accessSync(this.filename); //does the same thing as access but there is no callback involved. We have to wait for sometime till the node accesses the file
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        }
    }

    async create(attrs) {
        attrs.id = this.randomId();
        
        const records = await this.getAll();
        records.push(attrs);
        await this.writeAll(records);

        return attrs;
    }
    
    async getAll() {
        //open the file called this.filename
        return JSON.parse(  //It gives array of objects
            await fs.promises.readFile(this.filename, {
            encoding: 'utf8' })
        );
    }

    async writeAll(records) {
        //write the updated 'records' array back to this.filename
        await fs.promises.writeFile(
            this.filename, 
            JSON.stringify(records, null, 2) //2--> level of indentation used
        );
    }

    randomId() {  //it returns a buffer like 55 7a 15 1d so it is converted to string
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id) {
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }

    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }

    async update (id, attrs) {
        const records = await this.getAll();
        const record = records.find(record => record.id ===id);

        if (!record) {
            throw new Error(`Record with id ${id} not found`);
        } 

        //record === {email: 'test@test.com' }
        //attrs === {password:'password'};
        Object.assign(record, attrs); //it takes all the properties from attrs and assign them to records
        //record === {email: 'test@test.com', password:'password'};
        await this.writeAll(records);
    }

    async getOneBy(filters) { //filters can be email only or password only or only id or all of them
        const records = await this.getAll();

        for (let record of records) {
            let found = true;

            for (let key in filters) {
                if(record[key] != filters[key]) {
                    found = false;
                }
            }

            if (found) {
                return record;
            }
        }
    }
}