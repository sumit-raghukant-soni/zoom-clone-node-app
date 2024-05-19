const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: location.port || (location.protocol === 'https:' ? 443 : 80)
});

let myVideoStream, loggedUserID;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    
    peer.on('call', call => {
        call.answer(stream);

        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });
    socket.on('user-connected', userId => {
        setTimeout(connectToNewUser, 1000, userId, stream);
    });
});

peer.on('open', id => {
    loggedUserID = id;
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = document.getElementsByClassName('main__chat__window')[0];
    d.scrollTop = d.scrollHeight;
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span class="unmute">Unmute</span>
    `;
    document.querySelector('.main__mute__button').innerHTML = html;
}

// Message
let text = document.getElementById('chat_message');

document.addEventListener('keydown', (e) => {
    if(e.key == 'Enter' && text.value.length != 0) {
        socket.emit('message', text.value);
        text.value = '';
    }
});

socket.on('createMessage', message => {
    let ul = document.getElementsByClassName('messages')[0];
    let li = document.createElement('li');
    li.classList.add('message');
    li.classList.add('user__message');
    li.innerHTML = '<span class="message__header">' + 'You' + '</span><p class="message__body"><span>' + message + '</span></p>';
    ul.appendChild(li);
    scrollToBottom();
});

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `;
    document.querySelector('.main__video__button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span class="stop">Play Video</span>
    `;
    document.querySelector('.main__video__button').innerHTML = html;
}
