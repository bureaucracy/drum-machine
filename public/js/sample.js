var Sample = function () {
  this.sound = false;
  this.name = false;
  this._volume = 1;
  this._delay = 0;
  this._distortion = 0;

  document.querySelector('#wrapper').addEventListener('play', this._playAudio);
};

Sample.prototype = {
  _playAudio: function (event) {
    event.detail.sample.play(function () {
      document.querySelector('#wrapper').removeEventListener('play', this._playAudio);
    });
  },

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
    localforage.getItem(this.name, function (err, audio) {
      if (err) {
        console.log('error: ', err);
        return;
      }

      this.filename = audio.name;
      this.base64 = audio.data;
      next(this.filename);
    }.bind(this));
  },

  play: function (next) {
    document.querySelector('#wrapper').addEventListener('play', this._playAudio);
    var source = audioContext.createBufferSource();
    var gainNode = audioContext.createGain();
    var distortionNode = audioContext.createWaveShaper();

    if (!this.name) {
      console.log('no sound name/sample provided');
      return;
    }

    this._toArrBuffer(this.base64);

    audioContext.decodeAudioData(this.sound, function (buffer) {
      if (!this.buffer) {
        this.buffer = buffer;
      }

      source.buffer = this.buffer;
      source.connect(gainNode);
      gainNode.connect(distortionNode);
      distortionNode.connect(audioContext.destination);
      gainNode.gain.value = this._volume;
      distortionNode.curve = Effect.distortionCurve(this._distortion);
      distortionNode.oversample = '2x';
      source.start(0);
      next(true);
    }.bind(this));
  }
};
