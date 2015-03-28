var Track = function () {
  this.bpm = 120;
  this.isPlaying = false;
  this.sounds = {};
  this.samples = {};
  this.timestamp = (new Date()).getTime();
  this.currentNote = 16;
  this.id = false;
};

Track.prototype = {
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

  add: function (id, next) {
    var self = this;
    this.sounds[id] = {};
    this.samples[id] = new Sample();
    this.samples[id].name = 'audio-' + id;
    this.samples[id].bpm = this['_getBPM' + this.currentNote]();

    this.samples[id].load(function (filename) {
      for (var i = 0; i < 16; i ++) {
        self.sounds[id][i] = false;
      }
      console.log('loaded into track ', self.sounds);
      next(filename);
    });
  },

  stop: function () {
    var notes = document.querySelectorAll('.note');

    for (var i = 0; i < notes.length; i ++) {
      notes[i].classList.remove('playing');
    }

    this.start = 0;
    this.play = null;
  },


  loop: function (id) {
    this.stop();
    var counter = 0;
    var self = this;
    var bpm = this['_getBPM' + this.currentNote]();
    this.isPlaying = true;

    this.play = function () {
      try {
        requestAnimationFrame(self.play);
      } catch (err) { }

      var now = (new Date()).getTime();
      var delta = now - self.timestamp;

      if (delta >= bpm) {
        self.timestamp = now - (delta % bpm);

        document.querySelector('#note-' + self.id + '-' + counter).classList.remove('playing');

        for (var i = 0; i < Object.keys(self.samples).length; i ++) {
          if (self.sounds[i][counter]) {
            self.samples[i].play();
          }
        }

        counter ++;

        if (counter > 31) {
          counter = 0;
        }

        document.querySelector('#note-' + self.id + '-' + counter).classList.add('playing');
      }
    }

    this.play();
  }
};