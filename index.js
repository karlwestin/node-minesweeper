/*
 * Node Minesweeper
 */
var directions = [
  function(index, width) { return index - width - 1; },
  function(index, width) { return index - width; },
  function(index, width) { return index - width + 1; },
  function(index, width) { return index - 1; },
  function(index, width) { return index + 1; },
  function(index, width) { return index + width - 1; },
  function(index, width) { return index + width; },
  function(index, width) { return index + width + 1; }
];

function getDirections(index, width, height) {
  var isTop = index < width;
  var isBottom = Math.floor(index / width) === height - 1;
  var isLeft = index % width === 0;
  var isRight = index % width === width - 1;
  var directions = {
    "true_false_true_false":  [4,6,7],
    "true_false_false_true":  [3,5,6],
    "true_false_false_false": [3,4,5,6,7],
    "false_true_true_false":  [1,2,4],
    "false_true_false_true":  [0,1,3],
    "false_true_false_false": [0,1,2,3,4],
    "false_false_true_false": [1,2,4,6,7],
    "false_false_false_true": [0,1,3,5,6],
    "false_false_false_false":[0,1,2,3,4,5,6,7]
  };
  return directions[[isTop, isBottom, isLeft, isRight].join("_")];
}

/*
 * Current problems:
 * Know when player has won
 */
function Square(square, index, all) {
  var show = false;
  var number = square.number;

  function toString() {
    if(show) {
      if(number === -1) {
        return "X";
      } else {
        return number > 0 ? number.toString() : " ";
      }
    } 
    return Square.hidden;
  }

  function check() {
    show = true;
    if(number === -1) {
      throw new Error("You've hit a bomb and died");
    }
    return number;
  }

  function showEmpty() {
    if(show) { return false; }

    if(number !== -1) { show = true; }
    if(number === 0) { return true; }
    return false;
  }

  return {
    check: check,
    directions: square.directions,
    empty: showEmpty,
    toString: toString
  };
}

Square.hidden = "º";


function generateBoard(width, height, length, mines) {
  var board = [];
  // figure out directions
  for(var i = 0; i < length; i++) {
    board.push({ directions: getDirections(i, width, height), number: 0 });
  }

  // mine generation
  while(mines > 0) {
    var pos = Math.floor(Math.random() * board.length);
    if(board[pos].number == -1) {
      continue;
    }
    board[pos].number = -1;
    mines--;
  }

  function checkDirection(dir, index) {
    var i = dir(index, width);
    if(i >= 0 && i < board.length) {
      return board[i].number === -1;
    }
  }

  // summing up # of mines around
  return board.map(function(square, index, all) {
    if(square.number !== -1) {
      square.number = square.directions.reduce(function(sum, el) {
        return sum += checkDirection(directions[el], index);
      }, 0);
    } 
    return Square(square, index, all);
  });
}

function Board(width, height, mines) {
  var length = width * height;
  this.width = width;
  this.height = height;
  this.max = length - mines;
  this.cleared = 0;
 
  this.board = generateBoard(width, height, length, mines || 20);
  console.log("Play with instance.click(x, y), zero-based indexes");
}

function draw(square, index) {
  var ret = "";
  ret += square.toString();
  if(index && index % this.width === this.width -1) {
    ret += "\n";
  }
  return ret;
}

Board.prototype.render = function() {
  var board = this.board.map(draw, this);
  countScore.call(this, board);
  console.log(board.join(""));
  return board;
};

Board.prototype.click = function(x, y) {
  var point = y * this.width + x;
  var number = this.board[point].check();
  if(number === 0) {
    check.call(this, point);
  }

  return this.render();
};

function check(point) {
  this.board[point].directions.forEach(function(dir) {
    var newPoint = directions[dir](point, this.width);
    if(newPoint < 0 || newPoint >= this.board.length) {
      return;
    }

    var empty = this.board[newPoint].empty();
    if(empty) {
      check.call(this, newPoint);
    }
  }, this);
}

function countScore(board) {
  var length = board.length;
  board.forEach(function(el) {
    if(el.match(Square.hidden)) {
      length--;
    }
  });
  if(length >= this.max) {
    throw new Error("You've won!");
  }
}

module.exports = Board;
