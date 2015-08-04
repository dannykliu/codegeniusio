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

webrtc.on('createdPeer', function (peer) {
  console.log('peer: ' + peer);

  // Select and send file
  var fileinput = document.getElementById('fileinput');
  console.log(fileinput);
  fileinput.addEventListener('change', function() {
    console.log('file added');
    fileinput.disabled = true;

    var file = fileinput.files[0];
    var sender = peer.sendFile(file);
  });

  // receiving an incoming filetransfer
  peer.on('fileTransfer', function (metadata, receiver) {
    console.log('incoming filetransfer', metadata.name, metadata);
    receiver.on('progress', function (bytesReceived) {
      console.log('receive progress', bytesReceived, 'out of', metadata.size);
    });
    // get notified when file is done
    receiver.on('receivedFile', function (file, metadata) {
      console.log('received file', metadata.name, metadata.size);

      href = $('#download');
      href.attr('href', URL.createObjectURL(file));
      href.attr('download', metadata.name);
      href.removeAttr('hidden');
      // close the channel
      receiver.channel.close();
    });
  });
});
var screenShareResponse;
screenleap.setOptions({useCustomProtocol: true});

function onScreenShareStartError() {
    // Show instructions similar to the contents of the
    // retryCustomProtocolHandlerMessage div on the API demo page.
    // You can add a setTimeout() call here if you would like to give the user
    // more time to run the downloaded presenter app before showing the
    // instructions.
}
var onload = function() {
    screenleap.onScreenShareStart = function() {
        alert('Your screen is now shared.');
    };
    screenleap.onScreenShareEnd = function() {
        alert('Your screen share has ended.');
    };
    screenleap.error = function(action, errorMessage, xhr) {
        var msg = action + ': ' + errorMessage;
        if (xhr) {
            msg += ' (' + xhr.status + ')';
        }
        alert('Error in ' + msg);
    };
};

$.ajax({
  type:"POST",
  beforeSend: function (request)
  {
      request.setRequestHeader("authtoken", "nabMZZWyND");
  },
  url: "https://api.screenleap.com/v2/screen-shares?accountid=codegenius",
  processData: false,
  success: function(msg) {
    screenShareResponse = msg;
    $('#screenLink').attr('href', msg.viewerUrl);
  }
});


function onScreenShareStartError() {
    // Show instructions similar to the contents of the
    // retryCustomProtocolHandlerMessage div on the API demo page.
    // You can add a setTimeout() call here if you would like to give the user
    // more time to run the downloaded presenter app before showing the
    // instructions.
};

var startShare = function() {
  screenleap.startSharing('NATIVE', screenShareResponse, {screenShareStartError: onScreenShareStartError});
};


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
