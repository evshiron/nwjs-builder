
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('path');

var dirname = _require.dirname;
var join = _require.join;

var _require2 = require('fs');

var rename = _require2.rename;

var _require3 = require('fs-extra');

var readJson = _require3.readJson;
var emptyDir = _require3.emptyDir;
var copy = _require3.copy;
var remove = _require3.remove;

var _require4 = require('child_process');

var exec = _require4.exec;


var temp = require('temp');

var Flow = require('node-flow');

var NWD = require('nwjs-download');

var NWB = require('../../');

var BuildLinuxBinary = function BuildLinuxBinary(path, binaryDir, version, platform, arch, _ref, callback) {
    var _ref$outputDir = _ref.outputDir;
    var outputDir = _ref$outputDir === undefined ? null : _ref$outputDir;
    var _ref$withFFmpeg = _ref.withFFmpeg;
    var withFFmpeg = _ref$withFFmpeg === undefined ? false : _ref$withFFmpeg;
    var _ref$sideBySide = _ref.sideBySide;
    var sideBySide = _ref$sideBySide === undefined ? false : _ref$sideBySide;
    var _ref$production = _ref.production;
    var production = _ref$production === undefined ? false : _ref$production;


    var context = {};

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var _this = this;

        var majorIdx, _ref2, _ref3, err, manifest, _ref4, _ref5, _ref6, _ref7, workingDir, nodeModules, _ref8, _ref9, stdout, stderr, _ref10, _ref11, nwFile, executable, newName;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        majorIdx = 0;


                        console.log(majorIdx++ + ': Read package.json');

                        _context.next = 4;
                        return readJson(join(path, 'package.json'), cb.expect(2));

                    case 4:
                        _ref2 = _context.sent;
                        _ref3 = _slicedToArray(_ref2, 2);
                        err = _ref3[0];
                        manifest = _ref3[1];

                        if (!err) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 10:

                        this.manifest = manifest;
                        this.target = NWD.GetTarget(platform, arch);
                        this.buildName = manifest.name + '-' + this.target;
                        this.buildDir = outputDir ? join(outputDir, this.buildName) : join(dirname(path), this.buildName);

                        console.log(majorIdx++ + ': Prepare build directory at ' + this.buildDir);

                        _context.next = 17;
                        return emptyDir(this.buildDir, cb.expect(2));

                    case 17:
                        _ref4 = _context.sent;
                        _ref5 = _slicedToArray(_ref4, 1);
                        err = _ref5[0];

                        if (!err) {
                            _context.next = 22;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 22:

                        console.log(majorIdx++ + ': Copy binary from ' + binaryDir);

                        _context.next = 25;
                        return copy(binaryDir, this.buildDir, {}, cb.single);

                    case 25:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 28;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 28:
                        if (!withFFmpeg) {
                            _context.next = 35;
                            break;
                        }

                        console.log(majorIdx++ + ': Install ffmpeg for nw.js ' + version);

                        // Make a temporary directory.

                        _context.next = 32;
                        return temp.mkdir(null, function (err, tempDir) {

                            if (err) {
                                return cb.single(err);
                            }

                            // Extract FFmpeg to temporary directory.

                            NWB.DownloadAndExtractFFmpeg(tempDir, {
                                version: version, platform: platform, arch: arch
                            }, function (err, fromCache, tempDir) {

                                if (err) {
                                    return cb.single(err);
                                }

                                // Overwrite libffmpeg.so.

                                copy(join(tempDir, 'libffmpeg.so'), join(_this.buildDir, 'lib/libffmpeg.so'), {
                                    clobber: true
                                }, cb.single);
                            });
                        });

                    case 32:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 35;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 35:

                        console.log(majorIdx++ + ': Make working directory');

                        _context.next = 38;
                        return temp.mkdir(null, cb.expect(2));

                    case 38:
                        _ref6 = _context.sent;
                        _ref7 = _slicedToArray(_ref6, 2);
                        err = _ref7[0];
                        workingDir = _ref7[1];

                        if (!err) {
                            _context.next = 44;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 44:
                        _context.next = 46;
                        return copy(path, workingDir, cb.single);

                    case 46:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 49;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 49:

                        this.workingDir = workingDir;

                        if (!production) {
                            _context.next = 69;
                            break;
                        }

                        nodeModules = join(this.workingDir, 'node_modules');


                        console.log(majorIdx++ + ': Remove node_modules at ' + nodeModules);

                        _context.next = 55;
                        return remove(nodeModules, cb.single);

                    case 55:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 58;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 58:

                        console.log(majorIdx++ + ': Execute npm install at ' + this.workingDir);

                        _context.next = 61;
                        return exec('npm install', {
                            cwd: this.workingDir
                        }, cb.expect(3));

                    case 61:
                        _ref8 = _context.sent;
                        _ref9 = _slicedToArray(_ref8, 3);
                        err = _ref9[0];
                        stdout = _ref9[1];
                        stderr = _ref9[2];

                        if (!err) {
                            _context.next = 68;
                            break;
                        }

                        return _context.abrupt('return', callback(er));

                    case 68:

                        //console.log(stdout);
                        console.log(stderr);

                    case 69:
                        if (!sideBySide) {
                            _context.next = 78;
                            break;
                        }

                        console.log(majorIdx++ + ': Copy application from ' + this.workingDir);

                        _context.next = 73;
                        return copy(this.workingDir, this.buildDir, cb.single);

                    case 73:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 76;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 76:
                        _context.next = 94;
                        break;

                    case 78:

                        console.log(majorIdx++ + ': Compress application');

                        _context.next = 81;
                        return NWB.util.ZipDirectory(this.workingDir, [], temp.path(), cb.expect(2));

                    case 81:
                        _ref10 = _context.sent;
                        _ref11 = _slicedToArray(_ref10, 2);
                        err = _ref11[0];
                        nwFile = _ref11[1];

                        if (!err) {
                            _context.next = 87;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 87:
                        executable = NWB.GetExecutable(this.buildDir, this.target);


                        console.log(majorIdx++ + ': Combine executable at ' + executable);

                        _context.next = 91;
                        return NWB.util.CombineExecutable(executable, nwFile, cb.single);

                    case 91:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 94;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 94:
                        newName = manifest.name;


                        console.log(majorIdx++ + ': Rename application to ' + newName);

                        _context.next = 98;
                        return rename(join(this.buildDir, 'nw'), join(this.buildDir, newName), cb.single);

                    case 98:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 101;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 101:

                        console.log(majorIdx++ + ': Done');

                        callback(null, this.buildDir);

                    case 103:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }).bind(context));
};

module.exports = BuildLinuxBinary;