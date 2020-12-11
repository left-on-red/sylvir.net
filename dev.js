let fs = require('fs');
let child_process = require('child_process');

child_process.exec('sass --watch public/scss:public/css');

// starts up a sass listener for every /scss folder that exists in an endpoint
let endpoints = fs.readdirSync(`${__dirname}/endpoints`);
for (let e = 0; e < endpoints.length; e++) {
    if (fs.existsSync(`${__dirname}/endpoints/${endpoints[e]}/scss`)) {
        child_process.exec(`sass --watch endpoints/${endpoints[e]}/scss:endpoints/${endpoints[e]}/css`);
    }
}

let node = child_process.exec('node ./index.js');
node.stdout.pipe(process.stdout);