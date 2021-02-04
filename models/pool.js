const {Pool} = require('pg');
const config = require('../config');

// for when pg does not shut down gracefully
// https://stackoverflow.com/questions/20825734
// use this to find the PID:
// postgres -D /usr/local/var/postgres
// kill <PID>

const pool = {
  pool: new Pool(config.database),
  getClient: async() =>  {
    try {
      const client = await pool.pool.connect();
      return client;
    }
    catch(ex) {
      console.error(ex);
    }
  }
}

module.exports = pool;
