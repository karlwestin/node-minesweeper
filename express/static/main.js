require.config({
  shim: {
    "backbone": ["underscore", "jquery"]
  }
});

define([
  "./jquery", 
  "./underscore", 
  "./backbone", 
  "/socket.io/socket.io.js"
], function() {
  var MineView = Backbone.View.extend({
    classNames: {
      "º": "mine_untouched",
      " ": "mine_empty",
      "1": "mine_one",
      "2": "mine_two",
      "3": "mine_three",
      "X": "mine_dead"
    },
    events: { "click": "sendClick" },
    initialize: function(options) {
      this.socket = options.socket;
      this.listenTo(this.model, "change", this.render);
    },
    render: function() {
      this.el.className = "mine " + this.classNames[this.model.get("point")];
      return this;
    },
    sendClick: function(e) {
      e.preventDefault();
      this.socket.emit("click", { index: this.model.get("index") });
    }
  });

  var gameData = new Backbone.Collection();
  var socket = io.connect("http://" + window.location.host);
  socket.emit("join", { room: settings.id });

  socket.on("render", renderHandler);
  socket.on("won", function(data) {
    alert("you won!");
    renderHandler(data);
  });
  socket.on("lost", function(data) {
    alert("you lost!!");
    renderHandler(data);
  });

  function renderHandler(data) {
    if(gameData.length === 0) {
      setup(data);
    } else {
      setModels(data);
    }
  }

  function setup(data) {
    data.forEach(function(el, index) {
      gameData.add({ point: filter(el), index: index });
    });
    var $main = $("<div>").css({ 
      width: settings.width * 20 + "px", 
      height: settings.height * 20 + "px"
    }).appendTo(document.body);
    gameData.each(function(model) {
      var view = new MineView({ model: model, socket: socket }).render();
      $main.append(view.$el);
    });
  }

  function setModels(data) {
    gameData.each(function(model, index) {
      model.set({ point: filter(data[index]) });
    });
  }

  function filter(piece) {
    return piece[0].toString();
  }
});
