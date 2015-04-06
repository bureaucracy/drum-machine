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
      for (var i = 0; i < 16; i ++) {
        this.sounds[id][i] = false;
      }

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
  }
};
