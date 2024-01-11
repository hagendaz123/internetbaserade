  const http = require("http");
  const sh = require("serve-handler");
  const ws = require("ws");

  let count = 0;
  const server = http.createServer((req, res) => {
    return sh(req, res, { public: "public" });
  });

  const wss = new ws.WebSocketServer({ server });
  wss.on("connection", (client) => {
    console.log("Client connected!");
    client.on("message", (json) => {
    //console.log("Message: " + json);
      let msg = JSON.parse(json); 
      if (msg.hasOwnProperty("username")) {
        client.color = getDarkColor();
        if (msg.username.trim().length == 0) {
          client.username = "user_" + ++count; //Tilldelar klienten ett generiskt username (mha en counter) om inget anges
        } else {
          client.username = msg.username;
        }
        broadcast(
          `{"user":"${client.username}", "message":" has entered the chat!"}`
        );
        
      } else {
        if(msg.message.length < 1){
          //if(msg.message){
          console.log("NEJNEJNEJfrånserver");
          
        }
        else{
          broadcast(
            `{"user":"${client.username}", "message":"${msg.message}", "color":"${client.color}", "recipient":"${msg.recipient}", "sender":"${msg.sender}"}`
          );
        }
      //Skriv kod som anger vad som skall göras om vi tar emot ett meddelande som INTE innehåller nyckeln/egenskapen "username".  
      }
    });
    client.on("close", () => {
      broadcast(
        `{"user":"${client.username}", "message":" has left the chat!"}`
      );
    });
  });

  function broadcast(msg) {
    //console.log(msg.sender);
    for (const client of wss.clients) {
      if (client.readyState === ws.OPEN /*&& client.username === msg.recipient*/) {
        client.send(msg);
      }
    }
  }
  function getDarkColor() {
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += Math.floor(Math.random() * 10);
    }
    return color;
  }
  // getPubKey = function(username){
  //   url = 'http://localhost:19608/api/pubkeys/' + encodeURIComponent(username);
  // 	$.get(url).done(function(data){console.log(data)}).fail(function(error){console.log(errormessage)});

  // }
  server.listen(process.argv[2] || 8080, () => {
    console.log(
      `Server listening on port ${server._connectionKey.split("::::")[1]}...`
    );
  });
