var Sample = function () {
  this.sound = false;
  this.name = false;
  this.context = new (window.AudioContext || window.webkitAudioContext);
  this.bpm = 120;
};

function toArrBuffer(base64) {
  var binaryString = atob(base64);
  var len = binaryString.length;
  var bytes = new Uint8Array(len);

  for (var i = 0; i < len; i ++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

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
      next(self.sound);
    });
  },

  play: function () {
    var source = this.context.createBufferSource();
    var self = this;

    if (!this.name) {
      console.log('no sound name/sample provided');
      return;
    }

    this.load(function () {
      self.context.decodeAudioData(self.sound, function (buffer) {
        source.buffer = buffer;
        source.connect(self.context.destination);
        source.start(0);
      });
    });
  }
};