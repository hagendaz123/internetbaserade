const ws = new WebSocket(`ws://${window.document.location.host}`);

ws.onopen = function () {
  console.log("Websocket connection opened");
};
ws.onclose = function () {
  console.log("Websocket connection closed");
};
ws.onmessage = function (message) {

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msgCtn");

  var json = JSON.parse(message.data);
  const isOwnMessage = json.sender === username;

  console.log(isOwnMessage);

  if (!json.sender && !json.recipient) {
    msgDiv.innerText = json.user + ": " + json.message;
  } else {
    msgDiv.innerText = isOwnMessage
      ? `${username}: ${document.getElementById("messageinputBox").value}`
      : `${json.user}: ${json.recipient === "null" ? json.message : deCryptMessages(json.message)}`;
  }
  /*const msgDiv = document.createElement("div");
  msgDiv.classList.add("msgCtn");

  var json = JSON.parse(message.data);
   
  if(json.sender === undefined && json.recipient === undefined){
    msgDiv.innerText = json.user + ": " + json.message;
  }
  else{
    if(json.sender === username){
      let ownmessage = document.getElementById("messageinputBox").value;
      msgDiv.innerText = username + ": " + ownmessage; 
      
    }else{
        //console.log(json);
      // går in i if:en även om json.recipient är null eller undefined
      if (json.recipient === "null") {
        msgDiv.innerText = json.user + ": " + json.message;
        
      }else{
        json.message = deCryptMessages(json.message);
        msgDiv.innerText = json.user + ": " + json.message; 
        
    }
    }
  }

  var json = JSON.parse(message.data);
   
  if(json.sender !== undefined && json.recipient !== undefined){
    msgDiv.innerText = json.user + ": " + json.message;
  }
  else{
    if(json.sender === username){
      let ownmessage = document.getElementById("messageinputBox").value;
      msgDiv.innerText = username + ": " + ownmessage; 
      
    }else{
        //console.log(json);
      // går in i if:en även om json.recipient är null eller undefined
      if (json.recipient === "null") {
        msgDiv.innerText = json.user + ": " + json.message;
        
      }else{
        json.message = deCryptMessages(json.message);
        msgDiv.innerText = json.user + ": " + json.message; 
        
    }
    }
  }*/
  msgDiv.style.backgroundColor = json.color;
  document.getElementById("messages").appendChild(msgDiv);
  chat_div.scrollTop = chat_div.scrollHeight;
  document.getElementById("messageinputBox").value = "";
}; 

const user_div = document.getElementById("set_username");
const chat_div = document.getElementById("chat");
const userform = document.getElementById("userForm");
const msgform = document.getElementById("msgForm");
const errormessage = "User not found";
let username;
let ownmessage;

userform.addEventListener('submit',(event) => {
  event.preventDefault();
  //const username = userform.querySelector("#userinputBox").value;
  username = userform.querySelector("#userinputBox").value;
  getPubKeys();
  let user = new Object();
  user.username = username;
  ws.send(JSON.stringify(user));
  user_div.style.display = "none";
  chat_div.style.display = "flex";
});

msgform.addEventListener("submit", (event) => {
  event.preventDefault();
  ownmessage = document.getElementById("messageinputBox").value;
  let msg = new Object();
  msg.message = ownmessage;
  
  if (msg.message.length < 1) {
    alert("You cannot send an empty message!");
  } else {
    cryptMessage(msg.message)
      .then((encryptedMessage) => {
        msg.message = encryptedMessage.msg;
        msg.recipient = encryptedMessage.recipient;
        msg.sender = username;
        ws.send(JSON.stringify(msg));
      })
      .catch((error) => {
        console.error(error);
      });
  }
  //document.getElementById("messageinputBox").value = "";
});


async function cryptMessage(message){
  const user = userlist.value;
  if(user){
    try {
      const data = await getPubKey(user);
      //console.log("Public key retrieved:", data);
      var crypt = setKey(data);
      
      if (crypt) {
        crypt.msg = crypt.encrypt(message);
        crypt.recipient = user;
        return crypt;
        
      } else {
        console.error("Failed to initialize JSEncrypt");
      }
    } catch (error) {
      console.error(error);
    }
  }else{
    crypt = {msg: message, recipient: null};
    return crypt;
  }
  
}

function deCryptMessages(encryptedMessage){
  const privateKey = document.getElementById("privatekeyinputBox").value;
  //console.log(privateKey);
  let crypt = new JSEncrypt();
  crypt.setPrivateKey(privateKey);
  try {
    var dec = crypt.decrypt(encryptedMessage);
    if(dec){
      return dec;
    }else{
      return "Encrypted message";;
    }
    //return dec;
  } catch (error) {
    alert("cant decrypt");
  }

}
msgform.addEventListener("reset", (event) => {
  ws.close();
});


function getPubKeys(){
  url = 'http://localhost:19608/api/pubkeys';
	$.get(url).done(function(data){displayUsers(data)}).fail(function(error){console.log("The api is not available!")});
}
function getPubKey(user) {
  return new Promise((resolve, reject) => {
    url = 'http://localhost:19608/api/pubkeys/' + encodeURIComponent(user);
    $.get(url)
      .done(data => resolve(data))
      .fail(error => reject(error));
  });
}

function displayUsers(users){
  for (var index = 0; index < users.length; index++) {
    $('#userlist').append('<option value="' + users[index].username + '">' + users[index].username + '</option>');
 };
}
function setKey(key){
  let crypt = new JSEncrypt();
  crypt.setPublicKey(key.public_key);  
  return crypt;
}
