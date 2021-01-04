const pool = require('./pool');
let users = {
  getUsers: async() =>  {
    const client = await pool.getClient();
    try {
      const sql = 'select * from users order by username';
      const res = await client.query(sql);
      return res.rows;
    }
    catch (error) {
      console.error(error);
    }
    finally {
      client.release();
    }
  },
  getUser: async(id) =>  {
    const client = await pool.getClient();
    try {
      const sql = 'select * from users where id = $1';
      const res = await client.query(sql, [id]);
      return res.rows.length == 0 ? null : res.rows[0];
    }
    catch (error) {
      console.error(error);
    }
    finally {
      client.release();
    }
  },
  setUser: async(data) => {
    const client = await pool.getClient();
    try {
      var existing = users.getUsers();
      for(var i=0; i<existing.length; i++) {
        if (existing[i].username == data.username && existing[i].id != data.id) {
          return {"error": "User name is already in use"};
        }
      }
      if (data.id && data.id > 0) {
        let values = [data.username, data.fields, data.id];
        let sql = 'update users set "username" = $1, "fields" = $2, "modified" = NOW() where "id" = $3'
        let res = await client.query(sql, values);
        return res;
      }
      else {
        let values = [data.username, data.fields];
        let sql = 'insert into users ("username", "fields", "modified", "password") values ($1, $2,  NOW(), \'*\') returning id;'
        let res = await client.query(sql, values);
        return res;
      }
    }
    catch (error) {
      console.error(error);
    }
    finally {
      client.release();
    }
  }
}

module.exports = users;
