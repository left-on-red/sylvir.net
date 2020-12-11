let express = require('express');
let dotenv = require('dotenv');
let fs = require('fs');
let parse = require('./parse.js');
dotenv.config();

function ensureDir(path) {
    if (!fs.existsSync(`${__dirname}/${path}`)) { fs.mkdirSync(`${__dirname}/${path}`) }
}

function ensureFile(path, content) {
    if (!fs.existsSync(`${__dirname}/${path}`)) { fs.writeFileSync(`${__dirname}/${path}`, content) }
}

ensureDir('data');
ensureDir('data/avatars');
ensureDir('data/posts');
ensureFile('data/users.json', '{}');

let PORT = process.env.PORT || 80;

process.posts = [];
let postDir = fs.readdirSync(`${__dirname}/data/posts`);
for (let p = 0; p < postDir.length; p++) { process.posts.push({ id: postDir[p], meta: require(`./data/posts/${postDir[p]}/meta.json`) }) }

process.posts.sort(function(a, b) { return a.timestamp - b.timestamp });
process.posts.reverse();

let app = express();
app.use(express.json({ limit: '50mb' }));

process.root = __dirname;

app.get('/', function(request, response) { response.send(parse.page('home', `${__dirname}/public/html/index.html`)) });

app.get('/login', function(request, response) {
    response.send(parse.page('login', `${__dirname}/public/html/login.html`));
});

app.get('/logout', function(request, response) {
    response.send(parse.page('logout', `${__dirname}/public/html/logout.html`));
});

let endpoints = fs.readdirSync(`${__dirname}/endpoints`);

for (let e = 0; e < endpoints.length; e++) {
    // each router will have a unique name to prevent ambiguity
    if (fs.existsSync(`${__dirname}/endpoints/${endpoints[e]}/${endpoints[e]}_router.js`)) {
        // starts the corresponding router
        require(`${__dirname}/endpoints/${endpoints[e]}/${endpoints[e]}_router.js`)(app);

        // after the router populates it's routing paths,
        // this is done to ensure ease of resource access
        app.get(`/${endpoints[e]}/*`, function(request, response) {
            let path = request.params[0];
            if (path.endsWith('html') || path.endsWith('.html')) { response.status(404); return response.sendFile(`${__dirname}/public/html/404.html`) }

            // effectively maps /{endpoint}/* to the ~/endpoints/{endpoint} directory
            if (fs.existsSync(`${__dirname}/endpoints/${endpoints[e]}/${path}`)) { response.sendFile(`${__dirname}/endpoints/${endpoints[e]}/${path}`) }
        });
    }
}

app.get('/*', function(request, response) {
    let path = request.params[0];
    if (path.startsWith('html') || path.endsWith('.html')) { response.status(404); return response.sendFile(`${process.root}/public/html/404.html`) }

    if (fs.existsSync(`${process.root}/public/${path}`)) { response.sendFile(`${process.root}/public/${path}`) }
    else { response.status(404); response.sendFile(`${process.root}/public/html/404.html`) }
});

app.listen(PORT, function() { console.log(`listening on http://localhost:${PORT}`) })