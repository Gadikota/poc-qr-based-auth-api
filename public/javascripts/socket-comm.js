var appendMessage = function(parentElementID, message){
  var parentElement = document.getElementById(parentElementID)
  var childElement = document.createElement("li")
  childElement.innerHTML = message;
  parentElement.appendChild(childElement);
}
window.initComm = function(user_id){
  var iosocket = io.connect();
  var message2 = "socketio";

  appendMessage("socketio", "connecting");
  iosocket.on('connect', function () {
    appendMessage("socketio", "connected");
    iosocket.emit("message", {user_id: user_id});
  });

  iosocket.on(user_id, function(message) {
    var s = "Received --> "+message;
    appendMessage("socketio", s);
  });

  iosocket.on(user_id+'/qr', function(message){
    message = JSON.parse(message);
    var img = document.createElement('img')
    img.src = message.url
    img.class="qr-code"

    var container = document.getElementsByClassName("qr-code")[0];
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(img)
  })

  iosocket.on('disconnect', function() {
    appendMessage("socketio", "disconnected / closed");
  });
}