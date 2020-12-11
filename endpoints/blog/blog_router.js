let express = require('express');

let fs = require('fs');
let showdown = require('showdown');
let crypto = require('crypto');
let auth = require('./../../auth.js');
let parse = require('./../../parse.js');

/**
 * 
 * @param {express.Router} app 
 */
module.exports = function(app) {
    app.get('/blog/api', function(request, response) {
        let limit = request.query.limit ? !isNaN(request.query.limit) ? parseInt(request.query.limit) : 10 : 10;
        let offset = request.query.offset ? !isNaN(request.query.offset) ? parseInt(request.query.offset) : 0 : 0;

        let posts = process.posts;
        response.json(posts.slice(offset, offset + limit))
    });

    app.post('/blog/api', auth, function(request, response) {
        try {
            let md = request.body.md;
            let title = request.body.title;
            let author = request.user.id;
            let description = request.body.description;
            let tags = request.body.tags ? request.body.tags : [];

            if (!md) { return response.sendStatus(400) }
            if (!title) { return response.sendStatus(400) }

            let id = crypto.randomBytes(6).toString('base64').replace(/\//g, '-');
            let meta = { title: title, tags: tags, author: author, description: description, timestamp: Date.now() }
            
            fs.mkdirSync(`${process.root}/data/posts/${id}`);
            fs.writeFileSync(`${process.root}/data/posts/${id}/meta.json`, JSON.stringify(meta, null, 4));
            fs.writeFileSync(`${process.root}/data/posts/${id}/body.md`, md);

            process.posts.unshift({ id: id, meta: meta });

            response.status(200);
            return response.json({ id: id });
        }

        catch(error) { console.log(error) }
    });

    app.get('/blog', function(request, response) {
        response.send(parse.page('blog', `${process.root}/endpoints/blog/html/blog_index.html`));
    });

    app.get('/blog/new', function(request, response) {
        response.send(parse.page('new', `${process.root}/endpoints/blog/html/new_post.html`));
    });

    app.get('/blog/:id', function(request, response) {
        let id = request.params.id;
        let posts = process.posts;
        let meta;

        for (let p = 0; p < posts.length; p++) { if (posts[p].id == id) { meta = posts[p].meta; break; } }
        if (!meta) { response.status(404); return response.sendFile(`${process.root}/public/html/404.html`) }

        let page = fs.readFileSync(`${process.root}/endpoints/blog/html/blog_post.html`).toString();
        page = parse.html(page, { navbar: fs.readFileSync(`${process.root}/public/html/navbar.html`).toString() });
        page = parse.nav(page, 'blog');

        let converter = new showdown.Converter();
        page = parse.html(page, {
            post_title: meta.title,
            post_description: meta.description,
            post_content: converter.makeHtml(fs.readFileSync(`${process.root}/data/posts/${id}/body.md`).toString()).replace(/&amp;/g, '&')
        });

        response.send(page);
    });
}