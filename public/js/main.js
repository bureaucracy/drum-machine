(function () {
  var Context = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new Context();
  window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame;

  var sequencer = new Sequencer();
  sequencer.audioTotal = 0;

  function setNoteChanger() {
    var id = sequencer.counter;

    document.querySelector('#note-change-' + id).onchange = function (ev) {
      sequencer.tracks[ev.target.getAttribute('data-id')].currentNote = parseInt(this.value, 10);

      if (sequencer.isPlaying) {
        sequencer.play();
      }
    };

    document.querySelector('#delete-' + id).onclick = function (ev) {
      sequencer.remove(ev.target.getAttribute('data-id'));
    };
  }

  function loadAudio() {
    sequencer.addTrack();
    setNoteChanger();

    // bpm
    document.querySelector('#bpm').onchange = function () {
      var bpm = parseInt(this.value, 10);
      if (isNaN(bpm) || bpm > 500) {
        this.value = 120;
      }

      sequencer.bpm = this.value;

      if (sequencer.isPlaying) {
        sequencer.play();
      }
    };

    // notes
    document.querySelector('.notes-current').onchange = function (ev) {
      sequencer.tracks[ev.target.getAttribute('data-id')].currentNote = parseInt(this.value, 10);
      if (sequencer.isPlaying) {
        sequencer.play();
      }
    };

    // new track
    document.querySelector('#new-track').onclick = function () {
      sequencer.addTrack();
      setNoteChanger();
    };

    // play
    document.querySelector('#play').onclick = function () {
      sequencer.play();
    };

    // pause
    document.querySelector('#pause').onclick = function () {
      sequencer.stop();
    };

    // reset
    document.querySelector('#reset').onclick = function () {
      localforage.clear(function (err) {
        if (err) {
          console.log(err);
          return;
        }

        document.location.href = '/';
      });
    };

    document.querySelector('#loader').classList.add('hide');
  }

  function downloadAudio() {
    var http = new XMLHttpRequest();
    http.responseType = 'json';

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200) {
        var audioArr = http.response;

        for (var i = 0; i < audioArr.length; i ++) {
          var id = i;
          if (audioArr[id]) {
            localforage.setItem('audio-' + i, {
              data: audioArr[id].data,
              name: audioArr[id].name
            });
          }
        }

        localforage.setItem('downloaded', audioArr.length, function (err) {
          if (err) {
            console.log('error: ', err);
            return;
          }

          sequencer.audioTotal = audioArr.length;
          loadAudio();
        });
      }
    };

    http.open('GET', '/audio', true);
    http.send();
  }

  function init() {
    localforage.getItem('downloaded', function (err, total) {
      if (err || !total) {
        downloadAudio();
        return;
      }

      sequencer.audioTotal = total;
      loadAudio();
    });
  }

  init();
}).call(this);

