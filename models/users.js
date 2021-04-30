const pool = require('./pool');
let users = {
  getUsers: async() =>  {
    let client = null;
    try {
      client = await pool.getClient();
      const sql = 'select * from users order by username';
      const res = await client.query(sql);
      return res.rows;
    }
    catch (error) {
      console.error('Error selecting users');
      throw(error);
    }
    finally {
      client.release();
    }
  },
  getUser: async(id) =>  {
    let client = null;
    try {
      client = await pool.getClient();
      const sql = 'select * from users where id = $1';
      const res = await client.query(sql, [id]);
      return res.rows.length == 0 ? null : res.rows[0];
    }
    catch (error) {
      console.error('Error selecting user');
      throw(error);
    }
    finally {
      client.release();
    }
  },
  setOrder: async(user, order) => {
    let client = null;
    try {
      client = await pool.getClient();
      let sql = 'update users set "order" = $1 where "id" = $2';
      let values = [order, user];
      let res = await client.query(sql, values);
      return res;
    }
    catch (error) {
      console.error('Error updating user order');
      throw(error);
    }
    finally {
      client.release();
    }
  },
  setUser: async(data) => {
    let client = null;
    try {
      client = await pool.getClient();
      var existing = users.getUsers();
      for(var i=0; i<existing.length; i++) {
        if (existing[i].username == data.username && existing[i].id != data.id) {
          return {"error": "User name is already in use"};
        }
      }

      if (!data.height) {
        data.height = null;
      }

      if (data.id && data.id > 0) {
        let values = [
          data.username,
          data.fields,
          data.height,
          data.theme,
          data.persist,
          data.id];
        let sql =
        `update users
          set "username" = $1,
          "fields" = $2,
          "height" = $3,
          "theme" = $4,
          "persist" = $5,
          "modified" = NOW()
        where "id" = $6`;
        let res = await client.query(sql, values);
        return data.id;
      }
      else {
        let values = [
          data.username,
          data.fields,
          data.height,
          data.theme,
          data.persist];
        let sql =
        `insert into users
          ("username","fields","height","theme","persist","modified","password")
        values
          ($1, $2, $3, $4, $5, NOW(),'*')
        returning id;`;
        let res = await client.query(sql, values);
        return res.rows[0].id;
      }
    }
    catch (error) {
      console.error('Error modifying user');
      throw(error);
    }
    finally {
      client.release();
    }
  },
  persistDays: 60
}

module.exports = users;
