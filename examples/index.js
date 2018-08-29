var { Elm } = require('./src/Main.elm');
var node = document.querySelector('main');
Elm.Main.init({ node: node });
