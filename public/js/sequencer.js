var Sequencer = function () {
  this.bpm = 120;
  this.tracks = {};
  this.counter = 0;
  this.isPlaying = false;
  this.timestamp32 = (new Date()).getTime();
  this.timestamp16 = (new Date()).getTime();
  this.timestamp8 = (new Date()).getTime();
  this.timestamp4 = (new Date()).getTime();
  this.timestamp2 = (new Date()).getTime();
};

Sequencer.prototype = {
  // thirty second note
  _getBPM32: function () {
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;
    var note = Math.round((qtr / 8) * 100000) / 100000;

    return Math.round(note * 100000) / 100000;
  },

  // sixteenth note
  _getBPM16: function () {
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;
    var note = Math.round((qtr / 4) * 100000) / 100000;

    return Math.round(note * 100000) / 100000;
  },

  // eighth note
  _getBPM8: function () {
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;
    var note = Math.round((qtr / 2) * 100000) / 100000;

    return Math.round(note * 100000) / 100000;
  },

  // quarter note
  _getBPM4: function () {
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;
    var note = Math.round(qtr * 100000) / 100000;

    return Math.round(note * 100000) / 100000;
  },

  // half note
  _getBPM2: function () {
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;
    var note = Math.round((qtr * 2) * 100000) / 100000;

    return Math.round(note * 100000) / 100000;
  },

  _generateNoteSelector: function () {
    var select = document.createElement('select');
    select.classList.add('notes-current');
    select.id = 'note-change-' + this.counter;
    select.setAttribute('data-id', this.counter);

    var notes = [32, 16, 8, 4, 2];
    var option;

    for (var i = 0; i < notes.length; i ++) {
      option = document.createElement('option');
      option.value = notes[i];
      option.textContent = '1/' + notes[i];
      if (notes[i] === 16) {
        option.setAttribute('selected', true);
      }
      select.appendChild(option);
    }

    return select;
  },

  addTrack: function () {
    var track = new Track();

    this.counter ++;

    track.id = this.counter;

    var self = this;

    function generateButtons(row) {
      var id = row.getAttribute('sound');

      // bars
      var bars = document.createElement('div');
      bars.classList.add('bars-row');

      for (var i = 0; i < 32; i ++) {
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

    var machine = document.querySelector('#machine');
    var footer = document.querySelector('#footer');
    var sequencerRow = document.createElement('div');
    sequencerRow.classList.add('sequencer');
    sequencerRow.id = 'sequencer-' + this.counter;

    var remove = document.createElement('button');
    remove.classList.add('delete');
    remove.setAttribute('data-id', this.counter);
    remove.id = 'delete-' + this.counter;
    remove.textContent = 'x';

    sequencerRow.appendChild(remove);

    // note markers
    var notes = document.createElement('div');
    notes.classList.add('notes');

    for (var i = 0; i < 32; i ++) {
      var span = document.createElement('span');
      span.textContent = i + 1;
      var note = document.createElement('div');
      note.id = 'note-' + this.counter + '-' + i;
      note.classList.add('note');
      if (i === 0) {
        note.classList.add('playing');
      }
      note.appendChild(span);
      notes.appendChild(note);
    }

    sequencerRow.appendChild(notes);
    sequencerRow.appendChild(this._generateNoteSelector());

    var counter = 0;

    for (var i = 0; i < this.audioTotal; i ++) {
      track.add(i, function (filename) {
        var sampleRow = document.createElement('div');
        sampleRow.classList.add('sample');
        sampleRow.id = 'sample-' + counter;
        sampleRow.setAttribute('sound', counter);

        var span = document.createElement('span');
        span.textContent = filename;
        sampleRow.appendChild(span);

        generateButtons(sampleRow);
        sequencerRow.appendChild(sampleRow);
        counter ++;
      });
    }

    this.tracks[this.counter] = track;
    machine.appendChild(sequencerRow);

    this.play();
  },

  stop: function () {
    this.isPlaying = false;

    for (var track in this.tracks) {
      this.tracks[track].stop();
    }

    this.playTrack = null;
  },

  _emit: function (what, detail) {
    var event = new CustomEvent(what, { detail: detail });
    document.querySelector('#wrapper').dispatchEvent(event);
  },

  play: function () {
    this.stop();
    var self = this;
    this.isPlaying = true;

    this.playTrack = function () {
      try {
        requestAnimationFrame(self.playTrack);
      } catch (err) { }

      var now = (new Date()).getTime();
      var delta32 = now - self.timestamp32;
      var delta16 = now - self.timestamp16;
      var delta8 = now - self.timestamp8;
      var delta4 = now - self.timestamp4;
      var delta2 = now - self.timestamp2;

      // 1/32
      if (delta32 >= self._getBPM32()) {
        self.timestamp32 = now - (delta32 % self._getBPM32());
        self._emit('track', {
          note: 32
        });
      }

      // 1/16
      if (delta16 >= self._getBPM16()) {
        self.timestamp16 = now - (delta16 % self._getBPM16());
        self._emit('track', {
          note: 16
        });
      }

      // 1/8
      if (delta8 >= self._getBPM8()) {
        self.timestamp8 = now - (delta8 % self._getBPM8());
        self._emit('track', {
          note: 8
        });
      }

      // 1/4
      if (delta4 >= self._getBPM4()) {
        self.timestamp4 = now - (delta4 % self._getBPM4());
        self._emit('track', {
          note: 4
        });
      }

      // 1/2
      if (delta2 >= self._getBPM2()) {
        self.timestamp2 = now - (delta2 % self._getBPM2());
        self._emit('track', {
          note: 2
        });
      }
    };

    this.playTrack();
  },

  remove: function (id) {
    this.tracks[id].stop();
    delete this.tracks[id];
    var seq = document.querySelector('#sequencer-' + id);
    seq.parentNode.removeChild(seq);
  }
};