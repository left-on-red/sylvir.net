let requests = require('./requests.js');
require('dotenv').config();

(async function() {
    let args = process.argv.slice(2);
    let username = args[0];
    let password = args[1];
    let token = await requests.post(`http://localhost:${process.env.PORT}/api/user`, { username: username, password: password })
    if (token.token) { console.log(`user created successfully`) }
    else { console.log(token) }
})();