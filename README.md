# health-records-pg

health-records-pg is a simple web app using NodeJS and Postrges to store and visualize health records.

Plotty.js is used to plot graphs of the daily records.

Not included in this repository is the config.js file at the root of the project. This file contains the credentials used to log in to Postgres as well as session and server settings. Below is an example of what this file should contain.

```
module.exports = {
  database: { // pg connection values
    host: 'localhost',
    user: 'db_user',
    password: 'db_password',
    database: 'health',
    port: 5432
  },
  server: {
    approot: __dirname,
    port:8300
  },
  session: {
    name: 'session', // name of session cookie
    maxAge: 30 * (24 * 60 * 60 * 1000), // 30 days in ms
    key: 'session_secret'
  }
};
```
