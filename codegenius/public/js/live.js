var editor = ace.edit("editor");
editor.setByAPI = false;
editor.setFontSize(18);
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

// Live editing
var socket = io.connect();
socket.on('editorUpdate', function (data) {
    editor.setByAPI = true;
    editor.setValue(data.contents);
    editor.clearSelection();
    editor.setByAPI = false;
});

editor.on('change', function() {
    if (!editor.setByAPI) {
        socket.emit('editorUpdate', {
            contents:editor.getValue()
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

//// Screen Sharing
var button = document.getElementById('screenShareButton'),
    setButton = function (bool) {
        button.innerText = bool ? 'share screen' : 'stop sharing';
    };
if (!webrtc.capabilities.screenSharing) {
    button.disabled = 'disabled';
}
webrtc.on('localScreenRemoved', function () {
    setButton(true);
});

setButton(true);

button.click(function () {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
        setButton(true);
    } else {
        webrtc.shareScreen(function (err) {
            if (err) {
                setButton(true);
            } else {
                setButton(false);
            }
        });

    }
});

// local screen obtained
webrtc.on('localScreenAdded', function (video) {
    video.onclick = function () {
        video.style.width = video.videoWidth + 'px';
        video.style.height = video.videoHeight + 'px';
    };
    document.getElementById('localScreenContainer').appendChild(video);
    $('#localScreenContainer').show();
});
// local screen removed
webrtc.on('localScreenRemoved', function (video) {
    document.getElementById('localScreenContainer').removeChild(video);
    $('#localScreenContainer').hide();
});
