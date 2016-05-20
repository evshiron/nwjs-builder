
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('path');

var join = _require.join;

var _require2 = require('fs');

var readdir = _require2.readdir;
var lstat = _require2.lstat;
var createWriteStream = _require2.createWriteStream;
var createReadStream = _require2.createReadStream;

// compress/decompress modules.

var _require3 = require('zlib');

var createGunzip = _require3.createGunzip;

var tar = require('tar-fs');
var DecompressZip = require('decompress-zip');
var archiver = require('archiver');

var Flow = require('node-flow');

var ZipDirectory = function ZipDirectory(path, excludes, destination, callback) {

    var debug = require('debug')('NWB:ZipDirectory');

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var stream, archive, bulks, _ref, _ref2, err, files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, src, _ref3, _ref4, _err, stats;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        stream = createWriteStream(destination);
                        archive = archiver.create('zip');


                        archive.on('error', function (err) {
                            return callback(err);
                        });
                        archive.on('end', function () {
                            return callback(null, destination);
                        });

                        archive.on('entry', function (entry) {
                            return debug('entry:', entry);
                        });

                        bulks = [];
                        _context.next = 8;
                        return readdir(path, cb.expect(2));

                    case 8:
                        _ref = _context.sent;
                        _ref2 = _slicedToArray(_ref, 2);
                        err = _ref2[0];
                        files = _ref2[1];

                        if (!err) {
                            _context.next = 14;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 14:
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 17;
                        _iterator = files[Symbol.iterator]();

                    case 19:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 32;
                            break;
                        }

                        file = _step.value;
                        src = join(path, file);
                        _context.next = 24;
                        return lstat(src, cb.expect(2));

                    case 24:
                        _ref3 = _context.sent;
                        _ref4 = _slicedToArray(_ref3, 2);
                        _err = _ref4[0];
                        stats = _ref4[1];


                        if (stats.isFile()) {

                            archive.file(src, {
                                name: file
                            });
                        } else if (stats.isDirectory()) {

                            archive.directory(src, file, {});
                        }

                    case 29:
                        _iteratorNormalCompletion = true;
                        _context.next = 19;
                        break;

                    case 32:
                        _context.next = 38;
                        break;

                    case 34:
                        _context.prev = 34;
                        _context.t0 = _context['catch'](17);
                        _didIteratorError = true;
                        _iteratorError = _context.t0;

                    case 38:
                        _context.prev = 38;
                        _context.prev = 39;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 41:
                        _context.prev = 41;

                        if (!_didIteratorError) {
                            _context.next = 44;
                            break;
                        }

                        throw _iteratorError;

                    case 44:
                        return _context.finish(41);

                    case 45:
                        return _context.finish(38);

                    case 46:

                        archive.pipe(stream);

                        archive.finalize();

                    case 48:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[17, 34, 38, 46], [39,, 41, 45]]);
    }));
};

var ExtractZip = function ExtractZip(path, destination, callback) {

    var unzip = new DecompressZip(path);
    unzip.on('error', function (err) {
        return callback(err);
    }).on('extract', function () {
        return callback(null, destination);
    }).extract({
        path: destination,
        // Ignore the root directory.
        strip: 1
    });
};

var ExtractTarGz = function ExtractTarGz(path, destination, callback) {

    var gunzip = createGunzip();
    var untar = tar.extract(destination, {
        map: function map(header) {
            return Object.assign(header, {
                // Ignore the root directory.
                name: header.name.split('/').slice(1).join('/')
            });
        }
    });

    var stream = createReadStream(path);

    stream.pipe(gunzip).on('error', function (err) {
        return callback(err);
    }).pipe(untar).on('finish', function () {
        return callback(null, destination);
    });
};

var CombineExecutable = function CombineExecutable(executable, nwFile, callback) {

    var nwStream = createReadStream(nwFile);
    var stream = createWriteStream(executable, {
        flags: 'a'
    });

    nwStream.on('error', function (err) {
        return callback(err);
    });
    stream.on('error', function (err) {
        return callback(err);
    });

    stream.on('finish', function () {
        return callback(null);
    });

    nwStream.pipe(stream);
};

Object.assign(module.exports, {
    ZipDirectory: ZipDirectory,
    ExtractZip: ExtractZip,
    ExtractTarGz: ExtractTarGz,
    CombineExecutable: CombineExecutable
});