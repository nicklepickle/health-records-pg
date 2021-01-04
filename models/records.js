const pool = require('./pool');

let records = {
  getRecords: async(user) =>  {
    const client = await pool.getClient();
    try {
      const sql = 'select * from records where "user" = $1 order by date';
      const res = await client.query(sql, [user]);
      //console.log('returned ' + res.rows.length + ' rows for user ' + user);
      return res.rows;
    }
    catch (error) {
      console.error(error);
    }
    finally {
      client.release();
    }
  },
  setRecord: async(data) => {
    const client = await pool.getClient();
    try {
      let keys = Object.keys(data);
      let values = [];

      for(var i = 0; i < keys.length; i++) {
        //@todo - sanitize date and key strings
        let value = (keys[i] == 'date' ? "'" + data[keys[i]] + "'" : Number(data[keys[i]]));
        keys[i] = '"' +keys[i] + '"';
        values.push(value);
      }
      keys.push('modified');
      values.push('NOW()');

      const sql = 'insert into records ('+ keys.join() +') values (' + values.join() + ')';
      console.log('running: ' + sql);
      const res = await client.query(sql);
      return res;
    }
    catch (error) {
      console.error(error);
    }
    finally {
      client.release();
    }
  },
  getFields: async() => {
    const client = await pool.getClient();
    try {
      sql = "select column_name from information_schema.columns " +
        "where table_name = 'records' and column_name not in ('date','id','modified','user')";
      const res = await client.query(sql);
      let fields = [];
      for(var i=0; i<res.rows.length; i++) {
        fields.push(res.rows[i].column_name);
      }
      return fields;
    }
    catch (error) {
      console.error(error);
    }
    finally {
      client.release();
    }
  }
}

module.exports = records;
