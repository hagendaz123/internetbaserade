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
  console.log(json);
  msgDiv.innerText = json.user + ": " + json.message;
  msgDiv.style.backgroundColor = json.color;
 
  //Se till att informationen som vi tar emot från servern läggs till i konstanten/diven msgDiv.
  document.getElementById("messages").appendChild(msgDiv);
  chat_div.scrollTop = chat_div.scrollHeight;
};

const user_div = document.getElementById("set_username");
const chat_div = document.getElementById("chat");
const userform = document.getElementById("userForm");
const msgform = document.getElementById("msgForm");
const errormessage = "User not found";

userform.addEventListener('submit',(event) => {
  event.preventDefault();
  const username = userform.querySelector("#userinputBox").value;
  const privatekey = userform.querySelector("#privatekeyinputBox").value;
  getPubKeys();
  let user = new Object();
  user.username = username;
  ws.send(JSON.stringify(user));
  user_div.style.display = "none";
  chat_div.style.display = "flex";
});

msgform.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("messageinputBox").value;
  let msg = new Object();
  msg.message = message;
  const privatekey = userform.querySelector("#privatekeyinputBox").value; 

  console.log(msg);

  if(msg.message <= 1){
    alert("NEJNEJNEJ")
  } else{
    //crypt(msg);
    ws.send(JSON.stringify(msg));
  }
  document.getElementById("messageinputBox").value = "";
});
msgform.addEventListener("reset", (event) => {
  ws.close();
});

function getPubKeys(){
  
  url = 'http://localhost:19608/api/pubkeys';
	$.get(url).done(function(data){displayUsers(data)}).fail(function(error){console.log(error)});
}
function displayUsers(users){
  for (var index = 0; index < users.length; index++) {
    $('#userlist').append('<option value="' + users[index].username + '">' + users[index].public_key + '</option>');
 }
}
function crypt(){
  var crypt = new JSEncrypt();

}
