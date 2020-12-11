let fs = require('fs');
let child_process = require('child_process');

child_process.execSync(`sass public/scss:public/css`);
console.log('compiled public/scss');

let endpoints = fs.readdirSync(`${__dirname}/endpoints`);
for (let e = 0; e < endpoints.length; e++) {
    if (fs.existsSync(`${__dirname}/endpoints/${endpoints[e]}/scss`)) {
        child_process.execSync(`sass endpoints/${endpoints[e]}/scss:endpoints/${endpoints[e]}/css`);
        console.log(`compiled endpoints/${endpoints[e]}/scss`);
    }
}