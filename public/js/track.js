var Track = function () {
  this.sounds = {};
  this.samples = {};
  this.timestamp = (new Date()).getTime();
  this.currentNote = 16;
  this.counter = 0;
  this.id = false;

  var wrapper = document.querySelector('#wrapper');

  wrapper.addEventListener('track', playTrack.bind(this));
  wrapper.removeEventListener('track', playTrack.bind(this));

  function playTrack(event) {
    if (this.currentNote === event.detail.note) {
      this.play();
    }
  }
};

Track.prototype = {
  _playTrack: function (event) {
    if (this.currentNote === event.detail.note) {
      this.play();
    }
  },

  _emit: function (what, detail) {
    var event = new CustomEvent(what, { detail: detail });
    document.querySelector('#wrapper').dispatchEvent(event);
  },

  add: function (id, next) {
    this.sounds[id] = {};
    this.samples[id] = new Sample();
    this.samples[id].name = 'audio-' + id;

    this.samples[id].load(function (filename) {

      next(filename);
    }.bind(this));
  },

  setVolumeUp: function (id) {
    this.samples[id].volume = Math.round((this.samples[id].volume + 0.10) * 10) / 10;

    document.querySelector('#volume-down-' + this.id + '-' + id).removeAttribute('disabled');

    if (this.samples[id].volume >= 1) {
      document.querySelector('#volume-up-' + this.id + '-' + id).setAttribute('disabled', true);
      this.samples[id].volume = 1;
    } else {
      document.querySelector('#volume-up-' + this.id + '-' + id).removeAttribute('disabled');
    }

    return this.samples[id].volume;
  },

  setVolumeDown: function (id) {
    this.samples[id].volume = Math.round((this.samples[id].volume - 0.10) * 10) / 10;

    document.querySelector('#volume-up-' + this.id + '-' + id).removeAttribute('disabled');

    if (this.samples[id].volume <= 0) {
      document.querySelector('#volume-down-' + this.id + '-' + id).setAttribute('disabled', true);
      this.samples[id].volume = 0;
    } else {
      document.querySelector('#volume-down-' + this.id + '-' + id).removeAttribute('disabled');
    }

    return this.samples[id].volume;
  },

  setDistortionUp: function (id) {
    this.samples[id].distortion = this.samples[id].distortion + 100;

    document.querySelector('#distortion-down-' + this.id + '-' + id).removeAttribute('disabled');

    if (this.samples[id].distortion >= 1000) {
      document.querySelector('#distortion-up-' + this.id + '-' + id).setAttribute('disabled', true);
      this.samples[id].distortion = 1000;
    } else {
      document.querySelector('#distortion-up-' + this.id + '-' + id).removeAttribute('disabled');
    }

    return this.samples[id].distortion;
  },

  setDistortionDown: function (id) {
    this.samples[id].distortion = this.samples[id].distortion - 100;

    document.querySelector('#distortion-up-' + this.id + '-' + id).removeAttribute('disabled');

    if (this.samples[id].distortion <= 0) {
      document.querySelector('#distortion-down-' + this.id + '-' + id).setAttribute('disabled', true);
      this.samples[id].distortion = 0;
    } else {
      document.querySelector('#distortion-down-' + this.id + '-' + id).removeAttribute('disabled');
    }

    return this.samples[id].distortion;
  },

  toggleEditRow: function (id, button) {
    var edit = document.querySelector('#edits-' + this.id + '-' + id);

    if (this.samples[id].showEditRow) {
      edit.classList.add('hide');
      button.textContent = '+';
      this.samples[id].showEditRow = false;
    } else {
      edit.classList.remove('hide');
      button.textContent = '-';
      this.samples[id].showEditRow = true;
    }
  },

  stop: function () {
    var notes = document.querySelectorAll('.note');

    for (var i = 0; i < notes.length; i ++) {
      notes[i].classList.remove('playing');
    }

    this.counter = 0;
  },

  play: function () {
    document.querySelector('#note-' + this.id + '-' + this.counter).classList.remove('playing');

    for (var i = 0; i < Object.keys(this.samples).length; i ++) {
      if (this.sounds[i][this.counter]) {
        var detail = {
          id: this.id,
          note: this.currentNote,
          sample: this.samples[i]
        };
        this._emit('play', detail);
      }
    }

    this.counter ++;

    if (this.counter > 31) {
      this.counter = 0;
    }

    document.querySelector('#note-' + this.id + '-' + this.counter).classList.add('playing');
  },

  serialize: function () {
    var output = '';
    output += this.currentNote + ':';
    for (var i in this.sounds) {
      output += this.samples[i]._volume + ',';
      output += this.samples[i]._distortion + ',';
      var n = 0;
      for (var j in this.sounds[i]) {
        if (this.sounds[i][j]) {
          n ++;
        }
        if (j < 31) {
          n = n << 1;
        }
      }
      output += n.toString(36) + ':';
    }
    return output.slice(0, -1);
  },

  deserialize: function (input, idx) {
    var rows = input.split(':');
    this.currentNote = parseInt(rows[0], 10);
    rows = rows.slice(1);
    rows.forEach(function(row, i) {
      var parts = row.split(',');
      var volume = parseFloat(parts[0], 10);
      var distortion = parseInt(parts[1], 10);
      var encodedSounds = parseInt(parts[2], 36);

      this.samples[i]._volume = volume;
      this.samples[i]._distortion = distortion;
      for (var j = 0; j < 32; j++) {
        this.sounds[i][31 - j] = !!(encodedSounds & 1);

        if (this.sounds[i][31 - j]) {
          document.querySelector('#bar-' + idx + '-' + (31 - j)).setAttribute('on', true);
        }
        encodedSounds = encodedSounds >> 1;
      }
    }.bind(this));
  }
};
