var Effect = function () { }

Effect.distortionCurve = function (amount) {
  var samples = 44100;
  var curve = new Float32Array(samples);
  var deg = Math.PI / 180;

  for (var i = 0; i < samples; i ++) {
    var x = i * 2 / samples - 1;

    curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
  }

  return curve;
};
