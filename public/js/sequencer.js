var Sequencer = function () {
  this.bpm = 120;
  this.tracks = {};
  this.counter = 0;
  this.isPlaying = false;
  this.trackTotal = 0;
  this.trackMax = 5; // maximum five simultaneous loaded

  this._notes = [2, 4, 8, 16, 32];

  function setBPM(nt) {
    var noteCalc = nt / 4;
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;

    if (noteCalc > 0) {
      noteCalc = qtr / noteCalc;
    } else {
      noteCalc = qtr * noteCalc;
    }

    return Math.round(noteCalc * 100000) / 100000;
  }

  for (var i = 0; i < this._notes.length; i ++) {
    this['timestamp' + this._notes[i]] = (new Date()).getTime();

    Sequencer.prototype['_getBPM' + this._notes[i]] = setBPM.bind(this, this._notes[i]);
  }
};

Sequencer.prototype = {
  _generateNoteSelector: function () {
    var select = document.createElement('select');
    select.classList.add('notes-current');
    select.id = 'note-change-' + this.counter;
    select.setAttribute('data-id', this.counter);

    var notes = this._notes;
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

  addTrack: function (next) {
    this.trackTotal ++;

    if (this.trackTotal > this.trackMax) {
      this.trackTotal = this.trackMax;
    }

    if (this.trackTotal > this.trackMax) {
      document.querySelector('#new-track').setAttribute('disabled', true);
      return;
    } else {
      document.querySelector('#new-track').removeAttribute('disabled');
    }

    var track = new Track();
    this.counter ++;

    track.id = this.counter;

    function setClick(id) {
      if (this.getAttribute('on') === 'true') {
        this.setAttribute('on', false);
        track.sounds[id][this.getAttribute('pos')] = false;
      } else {
        this.setAttribute('on', true);
        track.sounds[id][this.getAttribute('pos')] = true;
      }
    }

    function generateButtons(row) {
      var id = row.getAttribute('sound');

      // bars
      var bars = document.createElement('div');
      bars.classList.add('bars-row');

      for (var i = 0; i < 32; i ++) {
        var bar = document.createElement('button');
        pos = i;
        bar.classList.add('bar');
        bar.id = 'bar-' + this.counter + '-' + i;
        bar.setAttribute('pos', i);
        bar.onclick = setClick.bind(bar, id);

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

    function addSample(j, next) {
      track.add(j, function (filename) {
        var sampleRow = document.createElement('div');
        sampleRow.classList.add('sample');
        sampleRow.id = 'sample-' + this.counter + '-' + counter;
        sampleRow.setAttribute('sound', counter);

        var span = document.createElement('span');
        span.textContent = filename;
        sampleRow.appendChild(span);

        var button = document.createElement('button');
        button.classList.add('toggle-edits');
        button.setAttribute('data-edits', 'edits-' + this.counter + '-' + counter);
        button.textContent = '+';
        button.onclick = function () {
          var id = this.parentNode.getAttribute('sound');
          track.toggleEditRow(id, this);
        };

        sampleRow.appendChild(button);

        generateButtons.call(this, sampleRow);
        sequencerRow.appendChild(sampleRow);

        // volume, delay, etc
        var editsRow = document.createElement('div');
        editsRow.classList.add('edits');
        editsRow.id = 'edits-' + this.counter + '-' + counter;
        editsRow.setAttribute('sound', counter);
        editsRow.classList.add('hide');

        var span = document.createElement('span');
        span.id = 'volume-' + this.counter + '-' + counter;
        span.textContent = 1;

        editsRow.appendChild(span);

        button = document.createElement('button');
        button.classList.add('volume');
        button.classList.add('up');
        button.textContent = 'vol +';
        button.id = 'volume-up-' + this.counter + '-' + counter;
        button.setAttribute('data-track', span.id);
        button.setAttribute('disabled', true);
        button.onclick = function () {
          var id = this.parentNode.getAttribute('sound');
          var vol = track.setVolumeUp(id, 'up');
          document.querySelector('#' + this.getAttribute('data-track')).textContent = vol;
        };

        editsRow.appendChild(button);

        button = document.createElement('button');
        button.classList.add('volume');
        button.classList.add('down');
        button.textContent = 'vol -';
        button.id = 'volume-down-' + this.counter + '-' + counter;
        button.setAttribute('data-track', span.id);
        button.onclick = function () {
          var id = this.parentNode.getAttribute('sound');
          var vol = track.setVolumeDown(id, 'down');
          document.querySelector('#' + this.getAttribute('data-track')).textContent = vol;
        };

        editsRow.appendChild(button);

        span = document.createElement('span');
        span.id = 'delay-' + this.counter + '-' + counter;
        span.textContent = 0;

        editsRow.appendChild(span);

        button = document.createElement('button');
        button.classList.add('distortion');
        button.classList.add('up');
        button.textContent = 'distort +';
        button.id = 'distortion-up-' + this.counter + '-' + counter;
        button.setAttribute('data-track', span.id);
        button.onclick = function () {
          var id = this.parentNode.getAttribute('sound');
          var delay = track.setDistortionUp(id, 'up');
          document.querySelector('#' + this.getAttribute('data-track')).textContent = delay;
        };

        editsRow.appendChild(button);

        button = document.createElement('button');
        button.classList.add('distortion');
        button.classList.add('down');
        button.textContent = 'distort -';
        button.id = 'distortion-down-' + this.counter + '-' + counter;
        button.setAttribute('data-track', span.id);
        button.setAttribute('disabled', true);
        button.onclick = function () {
          var id = this.parentNode.getAttribute('sound');
          var delay = track.setDistortionDown(id, 'down');
          document.querySelector('#' + this.getAttribute('data-track')).textContent = delay;
        };

        editsRow.appendChild(button);

        sequencerRow.appendChild(editsRow);

        counter ++;

        if (counter === this.audioTotal) {
          next(true);
        }
      }.bind(this));
    }

    for (var j = 0; j < this.audioTotal; j ++) {
      addSample.call(this, j, next);
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
    this.isPlaying = true;

    function setTimer(notes) {
      var now = (new Date()).getTime();
      var delta = {};

      for (var i = 0; i < this._notes.length; i ++) {
        var note = this._notes[i];
        delta[note] = now - this['timestamp' + note];

        if (delta[note] >= this['_getBPM' + note]()) {
          this['timestamp' + note] = now - (delta[note] % this['_getBPM' + note]());
          this._emit('track', {
            note: note
          });
        }
      }
    }

    this.playTrack = function () {
      try {
        requestAnimationFrame(this.playTrack.bind(this));
      } catch (err) { }

      setTimer.call(this);
    };

    this.playTrack();
  },

  remove: function (id) {
    this.trackTotal --;

    if (this.trackTotal > 0) {
      this.trackTotal = 0;
    }

    if (this.trackTotal <= this.trackMax) {
      document.querySelector('#new-track').removeAttribute('disabled');
    }

    this.tracks[id].stop();
    delete this.tracks[id];
    var seq = document.querySelector('#sequencer-' + id);
    seq.parentNode.removeChild(seq);
  },

  serialize: function () {
    var output = '';
    for (var track in this.tracks) {
      output += this.tracks[track].serialize() + ';';
    }
    return output.slice(0, -1);
  },

  deserialize: function (input) {
    this.tracks = {};
    document.querySelector('#loader').classList.add('hide');
    input.split(';').forEach(function(part, i) {
      this.addTrack(function () {
        this.tracks[i + 1].deserialize(part, i + 1);
      }.bind(this));
    }.bind(this));
  }
};
