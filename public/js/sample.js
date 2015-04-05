var Sample = function () {
  this.sound = false;
  this.name = false;
  this._volume = 1;
  this._delay = 0;
  this._distortion = 0;

  document.querySelector('#wrapper').addEventListener('play', function (event) {
    event.detail.sample.play();
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

  set volume(value) {
    this._volume = value;
  },

  get volume() {
    return this._volume;
  },

  set distortion(value) {
    this._distortion = value;
  },

  get distortion() {
    return this._distortion;
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
    var gainNode = audioContext.createGain();
    var delayNode = audioContext.createDelay();
    var distortionNode = audioContext.createWaveShaper();
    var self = this;

    if (!this.name) {
      console.log('no sound name/sample provided');
      return;
    }

    this.load(function () {
      audioContext.decodeAudioData(this.sound, function (buffer) {
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(distortionNode);
        distortionNode.connect(audioContext.destination);
        gainNode.gain.value = this._volume;
        distortionNode.curve = Effect.distortionCurve(this._distortion);
        distortionNode.oversample = '2x';
        source.start(0);
      }.bind(this));
    }.bind(this));
  }
};