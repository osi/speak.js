var speakWorker;
try {
    speakWorker = new Worker('speakWorker.js');
} catch (e) {
    console.log('speak.js warning: no worker support');
}


var speaker = function () {
    var audioContext = new webkitAudioContext();
    var speakers = {};

    speakWorker.onmessage = function (event) {
        var text = event.data.text;
        console.log("generated speech for", text);
        speakers[text] = function() {
            var buffer = audioContext.createBuffer(event.data.sound.buffer, false);
            var source = audioContext.createBufferSource();
            source.playbackRate.value = 1;
            source.loop = false;
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.noteOn(0);
        }
    };

    return function (text) {
        if (!speakers[text]) {
            speakWorker.postMessage({ text: text, args: {amplitude: 500, pitch: 50, speed: 175} });
        }

        return function () {
            var s = speakers[text];
            if (s) {
                s();
            } else {
                console.log("speaker not yet available", text);
            }
        };
    }
}();


function speak(text) {
    speaker(text)();
}

