var gameLoadingError, ipcRenderer, loaded, loading, require, sendGameMessage, showError;

window.steam = false;

window.client_version = "1.1.0";

if (window.require == null) {
  require = function() {
    return {};
  };
}

ipcRenderer = require('electron').ipcRenderer;

loading = function() {
  window.loading_received = true;
  return sendGameMessage({
    name: "client_info",
    client_version: window.client_version
  });
};

loaded = function() {
  var err, greenworks, steam_initialized;
  window.loaded_received = true;
  if (window.steam) {
    if (window.steam_client_id == null) {
      steam_initialized = false;
      try {
        greenworks = require("./greenworks");
        console.info("initializing Steam: " + greenworks.init());
        steam_initialized = true;
        window.steam_client_id = greenworks.getSteamId();
      } catch (error) {
        err = error;
        console.info(err);
      }
      if (!(steam_initialized && (window.steam_client_id != null))) {
        showError("Please relaunch the game with Steam");
        setTimeout((function() {
          return ipcRenderer.send("quit");
        }), 5000);
        return;
      }
    }
    console.info("Client ID: " + JSON.stringify(window.steam_client_id));
    sendGameMessage({
      name: "steam_info",
      data: window.steam_client_id
    });
  }
  setTimeout((function() {
    return document.getElementById("content").style.opacity = 1;
  }), 1000);
  if (document.getElementById("logo") != null) {
    document.getElementById("logo").style.opacity = 0;
    setTimeout((function() {
      return document.body.removeChild(document.getElementById("logo"));
    }), 3000);
  }
  if (document.getElementById("neuronality") != null) {
    document.getElementById("neuronality").style.opacity = 0;
    return setTimeout((function() {
      return document.body.removeChild(document.getElementById("neuronality"));
    }), 3000);
  }
};

window.addEventListener("message", function(event) {
  console.info(JSON.stringify(event.data));
  if (event.data != null) {
    switch (event.data) {
      case "game_loaded":
        return loaded();
      case "game_loading":
        return loading();
      default:
        return ipcRenderer.send(event.data);
    }
  }
});

sendGameMessage = function(data) {
  return document.getElementById("gameframe").contentWindow.postMessage(JSON.stringify(data), "*");
};

showError = function(msg) {
  return document.getElementById("logo").innerHTML += "<br />" + msg;
};

setTimeout((function() {
  if (!(window.loading_received || window.loaded_received)) {
    return showError("Check your connection to internet");
  }
}), 15000);

setTimeout((function() {
  if (!window.loaded_received) {
    return showError("Failed to load game. Check your connection to internet and relaunch.");
  }
}), 60000);

setTimeout((function() {
  if (!window.loaded_received) {
    return ipcRenderer.send("quit");
  }
}), 75000);

gameLoadingError = function() {
  showError("Failed to load game. Check your connection to internet and relaunch.");
  return setTimeout((function() {
    return ipcRenderer.send("quit");
  }), 10000);
};
