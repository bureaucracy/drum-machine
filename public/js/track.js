var Track = function () {
  this.sounds = {};
  this.samples = {};
  this.timestamp = (new Date()).getTime();
  this.currentNote = 16;
  this.counter = 0;
  this.id = false;

  document.querySelector('#wrapper').addEventListener('track', function (event) {
    if (this.currentNote === event.detail.note) {
      this.play();
    }
  }.bind(this), false);
};

Track.prototype = {
  _emit: function (what, detail) {
    var event = new CustomEvent(what, { detail: detail });
    document.querySelector('#wrapper').dispatchEvent(event);
  },

  add: function (id, next) {
    var self = this;
    this.sounds[id] = {};
    this.samples[id] = new Sample();
    this.samples[id].name = 'audio-' + id;

    this.samples[id].load(function (filename) {
      for (var i = 0; i < 16; i ++) {
        self.sounds[id][i] = false;
      }

      next(filename);
    });
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