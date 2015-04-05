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
 //   if (this.sound) {
      // In Firefox, the arraybuffer seems to lose its content type after the first play.
      // If the sound doesn't exist anymore, we try loading it again.
 //     next(this.filename);
 //   }

    localforage.getItem(this.name, function (err, audio) {
      if (err) {
        console.log('error: ', err);
        return;
      }

      this.filename = audio.name;
      this._toArrBuffer(audio.data);
      next(this.filename);
    }.bind(this));
  },

  play: function () {
    var source = audioContext.createBufferSource();
    var gainNode = audioContext.createGain();
    var distortionNode = audioContext.createWaveShaper();
    var convolverNode = audioContext.createConvolver();

    if (!this.name) {
      console.log('no sound name/sample provided');
      return;
    }

    if (!source.buffer) {
      this.load(function () {
        audioContext.decodeAudioData(this.sound, function (buffer) {
          source.buffer = buffer;
          source.connect(gainNode);
          gainNode.connect(distortionNode);
          distortionNode.connect(audioContext.destination);
          gainNode.gain.value = this._volume;
          distortionNode.curve = Effect.distortionCurve(this._distortion);
          distortionNode.oversample = '2x';
        }.bind(this));
      }.bind(this));
    }

    source.start(0);
  }
};