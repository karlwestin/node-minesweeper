var Board = require("./index");

var b = new Board(20, 20);
b.render();
console.log("---");
b.click(17,19);
console.log("---");
b.click(3,0);
console.log("---");
b.click(1,4);
console.log("---");
b.click(1,5);
console.log("---");
b.click(0,6);

module.exports = b;
