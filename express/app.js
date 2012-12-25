var express = require("express");
var http = require("http");
var socketio = require("socket.io");
var Minesweeper = require("../index");

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

app.use("/static", express.static(__dirname + "/static"));
app.set("view engine", "jade");
app.set("views", __dirname + "/views");

var games = {};
function generateGame(id) {
  // SET DIFFICULTY HERE: width, height, number of mines
  var w = 20, h = 20;
  var board = new Minesweeper(w, h, 20);
  return {
    board: board,
    width: w,
    height: h,
    app: "main",
    id: id
  };
}

app.get("/", function(req, res) {
  var id = Math.random().toString().slice(2, 6).toString();
  games[id] = generateGame(id);
  res.redirect("/" + id);
});

// FFFFUUUUUUUUU
app.get("/favicon.ico", function(req, res) {
  res.send(404);
});

app.get("/:id", function(req, res) {
  var id = req.params.id.toString();
  if(!(id in games)) {
    console.log("Game not found", id);
    return res.redirect("/");
  }
  res.render("game", games[id]);
});

io.sockets.on("connection", function(socket, data) {
  socket.on("join", function(data) {
    socket.join(data.room);
    socket.room = data.room;
    if(!games[socket.room]) {
      return false;
    }

    socket.emit("render", games[socket.room].board.render());
  });

  socket.on("click", function(data) {
    var rendering;
    if(!games[socket.room]) {
      return false;
    }

    try {
      rendering = games[socket.room].board.click(data.index);
      io.sockets.in(socket.room).emit("render", rendering);
    } catch(e) {
      rendering = games[socket.room].board.render(true);
      if(/won/i.test(e.message)) {
        io.sockets.in(socket.room).emit("won", rendering);
      } else {
        io.sockets.in(socket.room).emit("lost", rendering);
      }
    }
  });
});

server.listen(3000, function() {
  console.log("Play minesweeper on port 3000");
});
