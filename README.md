# sylvir.dev
---
## purpose

the main purpose of this is to serve as a portfolio of sorts for myself as well as a flexible blog system. I plan to heavily expand this and hope to integrate as many of my projects into it as possible

---
## development

##### prerequisites
- [Node.js](https://nodejs.org/) installed
- [Sass CLI](https://sass-lang.com/install) installed

##### setup
- clone this repository and run `npm install` to install all the necessary dependencies
- make a .env file in this schema:
  - ```env
    TOKEN_SECRET=<TOKEN SECRET>
    PORT=<WEB SERVER PORT>
    ```
  - where `TOKEN_SECRET` is a random string of text that's used for the user auth token system. a sizable base-16 string should be fine
  - and where `PORT` is the port in which the web server will be hosted under

##### building
- run `npm run build` to build the app into a runnable state ( just compiles all the scss (sass) into css)
- run `npm start` to just start the main script (`node .` or `node index.js` works too)

##### developing
- run `npm run dev` to start up a nodemon instance as well as a few sass listeners
- to create a new user account, while the web server is running, run `node create_user.js <username> <password>`
  - where `<username>` would be the username that you want
  - and where `<password>` would be what you want your password to be
  - then proceed to the `/login` on the website and enter your credentials
  - *currently, the user api currently only allows one user account to exist at a time*
---