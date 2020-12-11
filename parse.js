let fs = require('fs');

// for server-side html parsing/rendering
module.exports = {
    html: function(html, variables) {
        let components = html.match(/(?<={{\s*).*?(?=\s*}})/gs);
        for (let c = 0; c < components.length; c++) { if (variables[components[c]]) { html = html.replace(`{{${components[c]}}}`, variables[components[c]]) } }
        return html;
    },

    nav: function(html, active) {
        let navs = [ 'home', 'posts', 'new', 'login', 'logout' ]
        let index = navs.indexOf(active);
        let obj = {};
        for (let n = 0; n < navs.length; n++) {
            let prop = `${navs[n]}_status`;
            if (n == index) { obj[prop] = 'active' }
            else { obj[prop] = '' }
        }
    
        return module.exports.html(html, obj);
    },

    page: function(name, path) {
        let page = fs.readFileSync(path).toString();
        let nav = fs.readFileSync(`${process.root}/public/html/navbar.html`).toString();
    
        page = module.exports.html(page, { navbar: nav });
        page = module.exports.nav(page, name);
    
        return page;
    }
}