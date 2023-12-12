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
	console.log("Message: " + json);
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
        //`{"user": "Server", "message":"${client.username} has entered the chat!"}`
      );
    } else {
      if(msg.message.length < 1){
        alert("NEJNEJNEJ")
        
      }
      else{
        broadcast(
          `{"user":"${client.username}", "message":"${msg.message}", "color":"${client.color}"}`
        );
      }

      
      
		//Skriv kod som anger vad som skall göras om vi tar emot ett meddelande som INTE innehåller nyckeln/egenskapen "username".  
    }
  });
  client.on("close", () => {
    broadcast(
      `{"user":"${client.username}", "message":" has left the chat!"}`
    );
    console.log(`${client.username} disconnected.`);
    // Notify other clients about the user leaving
    
    /**
    
    //console.log(`${(client.username ?? "Client")} disconnected.`); //Funkar endast på senare version av Node än den som finns på labbservern
    console.log(
      (Object.is(client.username, undefined) ? "Client" : client.username) +
        " disconnected."    
    );*/
   
  });
});

function broadcast(msg) {
  
  for (const client of wss.clients) {
    if (client.readyState === ws.OPEN) {
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

server.listen(process.argv[2] || 8080, () => {
  console.log(
    `Server listening on port ${server._connectionKey.split("::::")[1]}...`
  );
});
