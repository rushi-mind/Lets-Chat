// import { connect } from "http2";
import "https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js";
import config from "./config.js"

console.log('let the game begin');

// Global variables declaration
const MQTT_CONNECTION_HOST = `${config.WS_URL}/mqtt`;
const MQTT_CONNECTION_OPTION = {
    clientId: 'mqttx_' + Math.random().toString(16).slice(3),
};
let user;
let client;
let onlineUsers = [];
let currentTopic = `group-message`;
let currentMessage = `GROUP`;

const updateOnline = (users) => {
    document.getElementById('main2-div1').innerHTML = '<div style="color: green;">ONLINE</div>';
    let newChild = document.createElement('div');
    newChild.classList.add('online-users');
    newChild.id = `group-message`;
    newChild.innerText = `Group`;
    newChild.addEventListener('click', (e) => {
        currentTopic = e.target.id;
        currentMessage = 'GROUP';
        document.getElementById('current-chat').innerText = currentMessage;
        displayChat();
        document.getElementById('group-message').style.color = 'white';
    });
    document.getElementById('main2-div1').appendChild(newChild);
    users.forEach(currentUser => {
        if(currentUser.id != user.id) {
            let newChild = document.createElement('div');
            newChild.classList.add('online-users');
            newChild.id = currentUser.id;
            newChild.innerText = currentUser.name;
            newChild.addEventListener('click', (e) => {
                currentTopic = e.target.id;
                currentMessage = e.target.innerText;
                document.getElementById('current-chat').innerText = currentMessage;
                displayChat();
                document.getElementById(e.target.id).style.color = 'white';
            });
            document.getElementById('main2-div1').appendChild(newChild);
        }
    });
}

const displayChat = () => {
    let chat = currentTopic === 'group-message' ? 'chat-group' : `chat-${currentTopic}`;
    chat = JSON.parse(localStorage.getItem(chat));
    if(!chat) chat = [];
    let messageBox = document.getElementById('messages-box');
    messageBox.innerHTML = `
        <button style="float: right;" id="logout-button">Logout</button>
        <div class="message center">You joined the chat</div>
    `;
    
    chat.forEach(current => {
        let newChild = document.createElement('div');
        newChild.classList.add('message');
        newChild.classList.add(current.user.id === user.id ? 'right' : 'left');
        newChild.innerText = `${current.user.id === user.id ? 'YOU' : current.user.name}: ${current.message}`;
        messageBox.appendChild(newChild);
    });
}

const onJoinChat = () => {
    document.getElementById('main').style.display = 'none';
    document.getElementById('main2').style.display = 'flex';
    user = JSON.parse(localStorage.getItem('user'));
    onlineUsers[0] = user;

    client = mqtt.connect(MQTT_CONNECTION_HOST, MQTT_CONNECTION_OPTION);
    client.publish('user-joined', JSON.stringify(user));
    client.subscribe('user-joined');
    client.subscribe('user-left');
    client.subscribe('updated-users-list');
    client.subscribe(`${user.id}`);
    client.subscribe(`group-message`);
    document.getElementById('current-chat').innerText = currentMessage;
    
    displayChat();

    client.on('message', (topic, payload) => {
        payload = JSON.parse(payload.toString());
        let messageBox = document.getElementById('messages-box');
        let newChild = document.createElement('div');
        newChild.classList.add('message');
        switch (topic) {
            case 'user-joined':
                if (payload.id === user.id) break;
                newChild.classList.add('center');
                newChild.innerText = `${payload.name} joined the chat`;
                messageBox.appendChild(newChild);
                break;

            case 'group-message':
                if (payload.user.id === user.id) break;
                let chat = JSON.parse(localStorage.getItem('chat-group'));
                if(!chat) chat = [];
                chat.push(payload);
                localStorage.setItem('chat-group', JSON.stringify(chat));
                document.getElementById('group-message').style.color = 'yellow';
                if(currentTopic === 'group-message') displayChat();
                break;

            case 'user-left':
                newChild.classList.add('center');
                newChild.innerText = `${payload.name} left the chat`;
                messageBox.appendChild(newChild);
                break;

            case 'updated-users-list':
                onlineUsers = payload;
                updateOnline(onlineUsers);
                break;

            case `${user.id}`:
                let privateChat = JSON.parse(localStorage.getItem(`chat-${payload.user.id}`));
                if(!privateChat) privateChat = [];
                privateChat.push(payload);
                localStorage.setItem(`chat-${payload.user.id}`, JSON.stringify(privateChat));
                document.getElementById(payload.user.id).style.color = 'yellow';
                if(currentTopic == payload.user.id) displayChat();
                break;

            default:
                break;
        }
    });
}


if (!localStorage.getItem('user')) {
    document.getElementById('main').style.display = 'flex';
    document.getElementById('main2').style.display = 'none';
}
else onJoinChat();

// on click signup button
document.getElementById('signup-button').addEventListener('click', (e) => {
    document.getElementById('response-signup').innerText = '';
    let name = document.getElementById('name').value;
    let pin = document.getElementById('PIN-Signup').value;
    if (pin < 1000 || pin > 9999) {
        document.getElementById('response-signup').innerText = 'Enter 4 digit PIN only';
        document.getElementById('response-signup').style.color = 'red';
        return;
    }
    document.getElementById('name').value = '';
    document.getElementById('PIN-Signup').value = '';

    try {
        (async () => {
            let res = await fetch(`${config.HTTP_URL}/signup`, {
                method: 'post',
                body: JSON.stringify({ name, pin }),
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            });
            let data = await res.json();
            if (data.status === 1) {
                document.getElementById('response-signup').innerText = `Your ID is ${data.data.id}. Login to continue.`;
                document.getElementById('response-signup').style.color = 'green';
            }
            else {
                document.getElementById('response-signup').innerText = `Failed to create your account`;
                document.getElementById('response-signup').style.color = 'red';
            }
        })();
    } catch (error) {
        document.getElementById('response-signup').innerText = 'Failed to reach server';
        document.getElementById('response-signup').style.color = 'red';
        return;
    }
});


// on click login button
document.getElementById('login-button').addEventListener('click', (e) => {
    document.getElementById('response-login').innerText = '';
    let id = document.getElementById('id').value;
    let pin = document.getElementById('PIN-Login').value;
    if (pin < 1000 || pin > 9999) {
        document.getElementById('response-login').innerText = 'Enter 4 digit PIN only';
        document.getElementById('response-login').style.color = 'red';
        return;
    }
    document.getElementById('id').value = '';
    document.getElementById('PIN-Login').value = '';

    (async () => {
        try {
            let res = await fetch(`${config.HTTP_URL}/login`, {
                method: 'post',
                body: JSON.stringify({ id, pin }),
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            });
            let data = await res.json();
                if (data.status === 0) {
                    document.getElementById('response-login').innerText = data.message;
                    document.getElementById('response-login').style.color = 'red';
                }
                else {
                    localStorage.setItem('user', JSON.stringify({ name: data.data.name, id: data.data.id }));
                    onJoinChat();
                }
        } catch (error) {
            document.getElementById('response-login').innerText = 'Failed to reach server';
            document.getElementById('response-login').style.color = 'red';
            return;
        }
    })();
});

// on click send message button
document.getElementById('send-button').addEventListener('click', (e) => {
    let message = document.getElementById('message-text').innerText;
    if (message && message.length) {
        client.publish(currentTopic, JSON.stringify({ user, message }));
        let messageBox = document.getElementById('messages-box');
        let newChild = document.createElement('div');
        newChild.classList.add('message');
        newChild.classList.add('right');
        newChild.innerText = `YOU: ${message}`;
        messageBox.appendChild(newChild);
        let chat = JSON.parse(localStorage.getItem(currentTopic === 'group-message' ? 'chat-group' : `chat-${currentTopic}`));
        if(!chat) chat = [];
        chat.push({ user, message});
        localStorage.setItem(currentTopic === 'group-message' ? 'chat-group' : `chat-${currentTopic}`, JSON.stringify(chat));
    }
    document.getElementById('message-text').innerText = 'Enter your message here';
});
// on click logout button
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

window.onbeforeunload = () => {
    client.publish('user-left', JSON.stringify(user));
}