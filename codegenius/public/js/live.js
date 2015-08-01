var editor = ace.edit("editor");
editor.setByAPI = false;
editor.setFontSize(18);
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

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
