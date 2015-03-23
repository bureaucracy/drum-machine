(function () {
  var audioTotal = 0;
  var track = new Track();

  function generateButtons(row) {
    var id = row.getAttribute('sound');

    // bars
    var bars = document.createElement('div');
    bars.id = 'bars';

    for (var i = 0; i < 16; i ++) {
      var bar = document.createElement('button');
      pos = i;
      bar.classList.add('bar');
      bar.id = 'bar-' + i;
      bar.setAttribute('pos', i);

      bar.onclick = function () {
        if (this.getAttribute('on') === 'true') {
          this.setAttribute('on', false);
          track.sounds[id][this.getAttribute('pos')] = false;
        } else {
          this.setAttribute('on', true);
          track.sounds[id][this.getAttribute('pos')] = true;
        }
      };

      bars.appendChild(bar);
    }

    row.appendChild(bars);
  }

  function loadAudio() {

    var machine = document.querySelector('#machine');
    var footer = document.querySelector('#footer');
    var counter = 0;

    for (var i = 0; i < audioTotal; i ++) {
      track.add(i, function () {
        var sampleRow = document.createElement('div');
        sampleRow.classList.add('sample');
        sampleRow.id = 'sample-' + counter;
        sampleRow.setAttribute('sound', counter);

        var span = document.createElement('span');
        span.textContent = track.samples[counter].filename;
        sampleRow.appendChild(span);

        generateButtons(sampleRow);
        machine.appendChild(sampleRow);
        counter ++;
      });
    }

    // bpm
    document.querySelector('#bpm').onchange = function () {
      if (isNaN(parseInt(this.value, 10))) {
        this.value = 120;
      }

      track.bpm = this.value;

      if (track.isPlaying) {
        track.stop();
        track.loop();
      }
    };

    // play
    document.querySelector('#play').onclick = function () {
      track.loop();
    };

    // pause
    document.querySelector('#pause').onclick = function () {
      track.stop();
    }

    // note markers
    var notes = document.createElement('div');
    notes.id = 'notes';

    for (var i = 0; i < 16; i ++) {
      var note = document.createElement('div');
      note.id = 'note-' + i;
      note.classList.add('note');
      notes.appendChild(note);
    }

    machine.appendChild(notes);
    footer.appendChild(play);
    footer.appendChild(bpm);

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
            }, function (err) {
              if (err) {
                console.log('error: ', err);
              }
            });
          }
        }

        localforage.setItem('downloaded', audioArr.length, function (err) {
          if (err) {
            console.log('error: ', err);
            return;
          }

          audioTotal = audioArr.length;
          loadAudio();
        });
      } else {
        console.log('error ', http.status)
      }
    };

    http.open('GET', '/audio', true);
    http.send();
  };

  function init() {
    localforage.getItem('downloaded', function (err, total) {
      if (err || !total) {
        downloadAudio();
        return;
      }

      audioTotal = total;
      loadAudio();
    });
  }

  init();
}).call(this);

