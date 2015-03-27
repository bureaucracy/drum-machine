window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame;

window.cancelAnimationFrame = window.cancelAnimationFrame ||
                              window.mozCancelAnimationFrame

var Track = function () {
  this.bpm = 120;
  this.isPlaying = false;
  this.sounds = {};
  this.samples = {};
  this.timestamp = (new Date()).getTime();
};

Track.prototype = {
  _getBPM: function () {
    var qtr = Math.round(((60 / this.bpm) * 1000) * 100000) / 100000;
    var sixteenthNote = Math.round((qtr / 4) * 100000) / 100000;

    return Math.round(sixteenthNote * 100000) / 100000;
  },

  add: function (id, next) {
    var self = this;
    this.sounds[id] = {};
    this.samples[id] = new Sample();
    this.samples[id].name = 'audio-' + id;
    this.samples[id].bpm = this._getBPM();

    this.samples[id].load(function () {
      for (var i = 0; i < 16; i ++) {
        self.sounds[id][i] = false;
      }
      console.log('loaded into track ', self.sounds);
      next(true);
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

  loop: function () {
    var counter = 0;
    var self = this;
    var bpm = this._getBPM();
    this.isPlaying = true;

    this.play = function () {
      try {
        requestAnimationFrame(self.play);
      } catch (err) { }

      var now = (new Date()).getTime();
      var delta = now - self.timestamp;

      if (delta >= bpm) {
        self.timestamp = now - (delta % bpm);

        document.querySelector('#note-' + counter).classList.remove('playing');

        for (var i = 0; i < Object.keys(self.samples).length; i ++) {
          if (self.sounds[i][counter]) {
            self.samples[i].play();
          }
        }

        counter ++;

        if (counter > 15) {
          counter = 0;
        }

        document.querySelector('#note-' + counter).classList.add('playing');
      }
    }

    this.play();
  }
};