var editor = ace.edit("editor");
editor.setByAPI = false;
editor.setFontSize(18);
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

// Live editing
var socket = io.connect();
var room = 'room';
socket.emit('createRoom', room);

socket.on('editorUpdate', function (data) {
    editor.setByAPI = true;
    editor.setValue(data.contents);
    editor.clearSelection();
    editor.setByAPI = false;
});

editor.on('change', function() {
    if (!editor.setByAPI) {
        socket.emit('editorUpdate', {
          contents:editor.getValue(),
          room: room
        });
    }
});

// Camera stuff
var webrtc = new SimpleWebRTC({
	localVideoEl: 'localVideo',
	remoteVideosEl: 'remoteVideo',
	autoRequestMedia: true
});

webrtc.on('readyToCall', function () {
	webrtc.joinRoom('Test');
});

webrtc.on('videoAdded', function (video, peer) {
    console.log('video added', peer);
    var remotes = document.getElementById('remotes');
    if (remotes) {
        var container = document.createElement('div');
        container.className = 'videoContainer';
        container.id = 'container_' + webrtc.getDomId(peer);
        container.style = 'height: 100px;'
        container.appendChild(video);

        // suppress contextmenu
        video.oncontextmenu = function () { return false; };

        remotes.appendChild(container);
    }
});

webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed ', peer);
    var remotes = document.getElementById('remotes');
    var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
    if (remotes && el) {
        remotes.removeChild(el);
    }
});

//// Screen Sharing
//var button = document.getElementById('screenShareButton'),
//    setButton = function (bool) {
//        button.innerText = bool ? 'share screen' : 'stop sharing';
//    };
//if (!webrtc.capabilities.screenSharing) {
//    button.disabled = 'disabled';
//}
//webrtc.on('localScreenRemoved', function () {
//    setButton(true);
//});
//
//setButton(true);
//
//button.click(function () {
//    if (webrtc.getLocalScreen()) {
//        webrtc.stopScreenShare();
//        setButton(true);
//    } else {
//        webrtc.shareScreen(function (err) {
//            if (err) {
//                setButton(true);
//            } else {
//                setButton(false);
//            }
//        });
//
//    }
//});
//
//// local screen obtained
//webrtc.on('localScreenAdded', function (video) {
//    video.onclick = function () {
//        video.style.width = video.videoWidth + 'px';
//        video.style.height = video.videoHeight + 'px';
//    };
//    document.getElementById('localScreenContainer').appendChild(video);
//    $('#localScreenContainer').show();
//});
//// local screen removed
//webrtc.on('localScreenRemoved', function (video) {
//    document.getElementById('localScreenContainer').removeChild(video);
//    $('#localScreenContainer').hide();
//});
