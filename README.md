node-minesweeper
===

**a.k.a rö.js**

After reading [this blog-post](http://luckytoilet.wordpress.com/2012/12/23/2125/), 
i decided to try and make a minesweeper implementation in node.js, 
so people can play around with their own bots.

Install
----
`npm install https://github.com/karlwestin/node-minesweeper.git`

Use
---
```
var Board = require("minesweeper");
var game = new Board(10, 10, 10); // w, h # of mines

game.render();
game.click(0,1); // zero-based index

//both render and click returns a string representation of the board,
//which can be used for more elaborate rendering
