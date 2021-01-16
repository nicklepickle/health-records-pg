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
  setRecord: async(fields, data) => {
    const client = await pool.getClient();
    try {
      values = [];
      for(var i = 0; i < fields.length; i++) {
        let value = 'null';
        if (fields[i] == 'date') {
          if (!data.date.match(/[0-9]+\/[0-9]+\/[0-9]+/)) {
            console.log('date field ' + data.date + ' could not be parsed');
            return false;
          }
          value = "'" + data[fields[i]] + "'";
        }
        else if (data[fields[i]] && !isNaN(data[fields[i]])) {
          value = Number(data[fields[i]]);
        }

        fields[i] = '"' +fields[i] + '"';
        values.push(value);
      }

      fields.push('modified');
      values.push('NOW()');

      let sql = '';
      if (data.id && data.id > 0) {
        let pairs = [];
        for (let i=0; i<fields.length; i++) {
          pairs.push(fields[i] + '=' + values[i]);
        }
        sql += 'update records set ' + pairs.join() + ' where id = ' + data.id;
      }
      else if (data.user && data.user > 0) {
        sql = 'insert into records ('+ fields.join() +') values (' + values.join() + ')';
      }

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
  },
  getCsv: async(user, fields) => {
    try {
      var rows = await records.getRecords(user);
      fields.unshift('date')
      var csv = fields.join() + '\n';
      for(var i=0; i<rows.length; i++) {
        var vals = []
        for(var ii=0; ii<fields.length; ii++) {
          var val = rows[i][fields[ii]];
          if (fields[ii] == 'date' || fields[ii] == 'modified') {
            var dt = new Date(rows[i][fields[ii]]);
            val = dt.toLocaleDateString('en-US')
          }
          vals.push(val);
        }
        csv += vals.join() + '\n';
      }
      return csv;
    }
    catch (error) {
      console.error(error);
    }
  }
}

module.exports = records;
