let fs = require('fs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');
let validator = require('password-validator');
let express = require('express');

// eventually swap this out for an actual database
let users = require('./../../data/users.json');
let auth = require('./../../auth.js');

let multer = require('multer');
let upload = multer();

let schema = new validator();
schema.is().min(8);
schema.has().uppercase();
schema.has().lowercase();
schema.has().digits();
schema.has().not().spaces();

let SECRET = process.env.TOKEN_SECRET;

/**
 * 
 * @param {express.Router} app 
 */
module.exports = function(app) {
    app.post('/api/validate/password', function(request, response) {
        let password = request.body.password;
        if (!password) { return response.sendStatus(400) }
    
        let result = schema.validate(password, { list: true });
        request.json({ results: result.length == 0 ? true : result });
    });
    
    app.post('/api/validate/username', function(request, response) {
    
    });
    
    app.post('/api/user', function(request, response) {
        if (Object.keys(users).length > 0) { response.status(400); return response.json({ message: 'only one user account is permitted at this time' }) }

        let username = request.body.username;
        let password = request.body.password;
    
        if (!username || !password) { response.status(400); return response.json({ message: 'username and password are required fields' }) }
        if (username.includes(' ')) { response.status(400); return response.json({ message: 'usernames cannot contain spaces' }) }
        if (!schema.validate(password)) { response.status(400); return response.json({ message: 'missing password requirements' }) }
    
        for (let u in users) { if (users[u].username == username) { return response.json({ message: 'that username is already taken' }) } }
    
        let id = crypto.randomBytes(16).toString('hex');
    
        users[id] = { username: username, password: password };

        fs.writeFileSync(`${process.root}/data/users.json`, JSON.stringify(users, null, 4));
        let token = jwt.sign({ username: username, password: password, id: id }, SECRET);
        response.json({ token: token });
    });
    
    app.post('/api/login', function(request, response) {
        try {
            let username = request.body.username;
            let password = request.body.password;
            if (!username || !password) { response.status(400); return response.json({ message: 'username and password are required fields' }) }

            let id;
            for (let i in users) { if (users[i].username == username && users[i].password == password) { id = i; break; } }
            if (!id) { return response.sendStatus(404) }
        
            response.status(200);

            let token = jwt.sign({ username: username, password: password, id: id }, SECRET);
        
            response.json({ token: token });
        }

        catch(error) { console.log(error) }
    });

    app.get('/api/avatars/:id', function(request, response) {
        let id = request.params.id;
        if (!id) { return response.sendStatus(400) }
        if (!users[id]) { return response.sendStatus(404) }
        if (fs.existsSync(`${process.root}/data/avatars/${id}.png`)) { response.sendFile(`${process.root}/data/avatars/${id}.png`) }
    });
    
    app.post('/api/avatars/:id', auth, upload.single('avatar'), function(request, response) {
        let user = request.body.user;
        let id = request.params.id;
        if (!user) { return response.sendStatus(401) }
        if (!id) { return response.sendStatus(400) }
        if (user.id != id) { return response.sendStatus(401) }
    
        fs.writeFileSync(`${process.root}/data/avatars/${id}.png`, request.file.buffer);
    });
}