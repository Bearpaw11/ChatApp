const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')
    //get username and room from URL

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

// join chatroom
socket.emit('joinRoom', { username, room });

//get room and users

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});


//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    //get messae text
    const msg = e.target.elements.msg.value;

    //emit message to server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus();
})

//output message to dom
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    console.log(message.time)
    div.innerHTML = `<p class="meta">${message.username} <span>${moment(message.time).format('LT')}</span></p>
  <p class ="text">
  ${message.text}
  </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to the dom

function outputUsers(users) {
    console.log("out: ", users)
    if (users) {
        userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;}
}