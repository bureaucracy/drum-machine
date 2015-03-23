'use strict';

const conf = require('./conf');
const fs = require('fs');
const walk = require('walk');

const AUDIO_PATH = conf.get('audioPath');

let ctx = {
  analytics: conf.get('analytics'),
  env: process.env.NODE_ENV
};

exports.home = function (request, reply) {
  ctx.error = request.query.err || '';
  reply.view('index', ctx);
};

exports.audio = function (request, reply) {
  let files = [];
  let total = 0;
  let fileArr = [];

  let walker = walk.walk(AUDIO_PATH, { followLinks: false });

  walker.on('file', function (root, stat, next) {
    files.push(root + '/' + stat.name);
    next();
  });

  walker.on('end', function () {
    total = files.length;

    files.forEach(function (file, idx) {
      let base64 = '';
      let rs = fs.createReadStream(file, { encoding: 'base64' });

      rs.on('data', function (chunk) {
        base64 += chunk;
      });

      rs.on('error', function (err) {
        fileArr.push({
          data: false
        });
      });

      rs.on('end', function () {
        if (file.indexOf('.ogg') > -1) {
          fileArr.push({
            data: base64,
            name: file.split('.')[0].split('/')[1]
          });
        }

        if (idx === total - 1) {
          reply(fileArr);
        }
      });
    });
  });
};
