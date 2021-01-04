const {Pool} = require('pg');
const config = require('../config');

const pool = {
  pool: new Pool(config.database),
  getClient: async() =>  {
    const client = await pool.pool.connect();
    return client;
  }
}

module.exports = pool;
