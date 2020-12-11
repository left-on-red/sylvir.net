let jwt = require('jsonwebtoken');

let SECRET = process.env.TOKEN_SECRET;

// jwt powered authentication middleware for express
module.exports = function(request, response, next) {
    let header = request.headers['authorization'];
    let token = header && header.split(' ')[1];
    if (!token) { return response.sendStatus(401) }

    jwt.verify(token, SECRET, function(error, user) {
        if (error) { console.log(error); return response.sendStatus(403) }
        request.user = user;
        request.token = token;
        next();
    });
}