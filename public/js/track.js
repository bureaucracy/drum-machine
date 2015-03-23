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

    this.samples[id].load(function () {
      for (var i = 0; i < 16; i ++) {
        self.sounds[id][i] = false;
      }
      console.log('loaded into track ', self.sounds);
      next(true);
    });
  },

  play: function () {
    var self = this;
    this.isPlaying = true;

    for (var i = 0; i < 16; i ++) {
      var id = i;
      var on = self.sounds[0][id];
      var currSample = self.samples[0];

      setTimeout(function () {
        console.log(on)
        if (on) {

          currSample.play();
        }
      }, 1000);
    }
  },

  stop: function () {
    var notes = document.querySelectorAll('.note');

    for (var i = 0; i < notes.length; i ++) {
      notes[i].classList.remove('playing');
    }

    clearInterval(this.loopAudio);
  },

  loop: function () {
    this.stop();
    var self = this;

    this.isPlaying = true;
    var counter = 0;

    document.querySelector('#note-0').classList.add('playing');

    this.loopAudio = setInterval(function () {
      for (var i = 0; i < Object.keys(self.samples).length; i ++) {
        if (self.sounds[i][counter]) {
          self.samples[i].play();
        }
      }

      document.querySelector('#note-' + counter).classList.remove('playing');

      counter ++;

      if (counter > 15) {
        clearInterval(this.loopAudio);
        counter = 0;
      }

      document.querySelector('#note-' + counter).classList.add('playing');
    }, this._getBPM());
  }
};