var Sequencer = function () {
  this.bpm = 120;
  this.tracks = {};
  this.counter = 0;
  this.isPlaying = false;
};

Sequencer.prototype = {
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
  },

  stop: function () {
    this.isPlaying = false;

    for (var track in this.tracks) {
      this.tracks[track].stop();
    }
  },

  play: function () {
    this.isPlaying = true;

    for (var track in this.tracks) {
      this.tracks[track].stop();
      this.tracks[track].bpm = this.bpm;
      this.tracks[track].loop();
    }
  },

  remove: function (id) {
    console.log('removing')
    this.tracks[id].stop();
    delete this.tracks[id];
    var seq = document.querySelector('#sequencer-' + id);
    seq.parentNode.removeChild(seq);
  }
};