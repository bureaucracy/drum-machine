var Sample = function () {
  this.sound = false;
  this.name = false;
  this.bpm = 120;

  document.querySelector('#wrapper').addEventListener('play', function (event) {
    switch (event.detail.note) {
      case 32:
        event.detail.sample.play();
        break;
      case 16:
        event.detail.sample.play();
        break;
      case 8:
        event.detail.sample.play();
        break;
      case 4:
        event.detail.sample.play();
        break;
      case 2:
        event.detail.sample.play();
        break;
    }
  }, false);
};

Sample.prototype = {
  _toArrBuffer: function (data) {
    var binaryString = atob(data);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);

    for (var i = 0; i < len; i ++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    this.sound = bytes.buffer;
  },

  load: function (next) {
    var self = this;

    localforage.getItem(this.name, function (err, audio) {
      if (err) {
        console.log('error: ', err);
        return;
      }

      self.filename = audio.name;
      self._toArrBuffer(audio.data);
      next(self.filename);
    });
  },

  play: function () {
    var source = audioContext.createBufferSource();
    var self = this;

    if (!this.name) {
      console.log('no sound name/sample provided');
      return;
    }

    this.load(function () {
      audioContext.decodeAudioData(self.sound, function (buffer) {
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
      });
    });
  }
};