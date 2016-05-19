
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('path');

var dirname = _require.dirname;
var join = _require.join;

var _require2 = require('fs');

var writeFile = _require2.writeFile;
var readFile = _require2.readFile;
var rename = _require2.rename;

var _require3 = require('fs-extra');

var readJson = _require3.readJson;
var emptyDir = _require3.emptyDir;
var copy = _require3.copy;

var _require4 = require('child_process');

var exec = _require4.exec;


var temp = require('temp');

var glob = require('glob');

var plist = require('plist');

var Flow = require('node-flow');

var NWD = require('nwjs-download');

var NWB = require('../../');

var BuildDarwinBinary = function BuildDarwinBinary(path, binaryDir, version, platform, arch, _ref, callback) {
    var _ref$outputDir = _ref.outputDir;
    var outputDir = _ref$outputDir === undefined ? null : _ref$outputDir;
    var _ref$withFFmpeg = _ref.withFFmpeg;
    var withFFmpeg = _ref$withFFmpeg === undefined ? false : _ref$withFFmpeg;
    var _ref$sideBySide = _ref.sideBySide;
    var sideBySide = _ref$sideBySide === undefined ? false : _ref$sideBySide;
    var _ref$production = _ref.production;
    var production = _ref$production === undefined ? false : _ref$production;
    var _ref$macIcns = _ref.macIcns;
    var macIcns = _ref$macIcns === undefined ? null : _ref$macIcns;


    var debug = require('debug')('BuildDarwinBinary');

    var context = {};

    Flow(regeneratorRuntime.mark(function _callee2(cb) {
        var _this = this;

        var majorIdx, _ref2, _ref3, err, manifest, _ref4, _ref5, _ret, workingDir, _ref6, _ref7, stdout, stderr, infoFile, _ref8, _ref9, pl, newName;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        majorIdx = 0;


                        console.log(majorIdx++ + ': Read package.json');

                        _context2.next = 4;
                        return readJson(join(path, 'package.json'), cb.expect(2));

                    case 4:
                        _ref2 = _context2.sent;
                        _ref3 = _slicedToArray(_ref2, 2);
                        err = _ref3[0];
                        manifest = _ref3[1];

                        if (!err) {
                            _context2.next = 10;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 10:

                        this.manifest = manifest;
                        this.target = NWD.GetTarget(platform, arch);
                        this.buildName = manifest.name + '-' + this.target;
                        this.buildDir = outputDir ? join(outputDir, this.buildName) : join(dirname(path), this.buildName);

                        console.log(majorIdx++ + ': Prepare build directory at ' + this.buildDir);

                        _context2.next = 17;
                        return emptyDir(this.buildDir, cb.expect(2));

                    case 17:
                        _ref4 = _context2.sent;
                        _ref5 = _slicedToArray(_ref4, 1);
                        err = _ref5[0];

                        if (!err) {
                            _context2.next = 22;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 22:
                        return _context2.delegateYield(regeneratorRuntime.mark(function _callee() {
                            var REGEX_FILTER_I18N;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:

                                            console.log(majorIdx++ + ': Copy binary from ' + binaryDir);

                                            REGEX_FILTER_I18N = /\/nwjs\.app\/Contents\/Resources\/[a-zA-Z0-9_]+\.lproj/;
                                            _context.next = 4;
                                            return copy(binaryDir, _this.buildDir, {
                                                // Ignore i18n files.
                                                filter: function filter(path) {
                                                    return !REGEX_FILTER_I18N.test(path);
                                                }
                                            }, cb.single);

                                        case 4:
                                            err = _context.sent;

                                            if (!err) {
                                                _context.next = 7;
                                                break;
                                            }

                                            return _context.abrupt('return', {
                                                v: callback(err)
                                            });

                                        case 7:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, _this);
                        })(), 't0', 23);

                    case 23:
                        _ret = _context2.t0;

                        if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                            _context2.next = 26;
                            break;
                        }

                        return _context2.abrupt('return', _ret.v);

                    case 26:
                        if (!withFFmpeg) {
                            _context2.next = 33;
                            break;
                        }

                        console.log(majorIdx++ + ': Install ffmpeg for nw.js ' + version);

                        // Make a temporary directory.

                        _context2.next = 30;
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

                                // Find original libffmpeg.dylib.

                                glob(join(_this.buildDir, 'nwjs.app/**/libffmpeg.dylib'), {}, function (err, files) {

                                    if (err) {
                                        return cb.single(err);
                                    }

                                    if (files && files[0]) {

                                        // Overwrite libffmpeg.dylib.

                                        copy(join(tempDir, 'libffmpeg.dylib'), files[0], {
                                            clobber: true
                                        }, cb.single);
                                    }
                                });
                            });
                        });

                    case 30:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 33;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 33:
                        if (!production) {
                            _context2.next = 55;
                            break;
                        }

                        console.log(majorIdx++ + ': Copy application from ' + path);

                        workingDir = join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw');
                        _context2.next = 38;
                        return copy(path, workingDir, {
                            filter: function filter(path) {
                                return !/node_modules/.test(path);
                            }
                        }, cb.single);

                    case 38:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 41;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 41:

                        console.log(majorIdx++ + ': Execute npm install at ' + workingDir);

                        _context2.next = 44;
                        return exec('npm install', {
                            cwd: workingDir
                        }, cb.expect(3));

                    case 44:
                        _ref6 = _context2.sent;
                        _ref7 = _slicedToArray(_ref6, 3);
                        err = _ref7[0];
                        stdout = _ref7[1];
                        stderr = _ref7[2];

                        if (!err) {
                            _context2.next = 51;
                            break;
                        }

                        return _context2.abrupt('return', callback(er));

                    case 51:

                        //console.log(stdout);
                        console.log(stderr);

                        this.workingDir = workingDir;

                        _context2.next = 61;
                        break;

                    case 55:

                        console.log(majorIdx++ + ': Copy application from ' + path);

                        _context2.next = 58;
                        return copy(path, join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw'), {}, cb.single);

                    case 58:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 61;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 61:
                        infoFile = join(this.buildDir, 'nwjs.app', 'Contents', 'Info.plist');


                        console.log(majorIdx++ + ': Modify Info.plist at ' + infoFile);

                        _context2.next = 65;
                        return readFile(infoFile, {
                            encoding: 'utf-8'
                        }, function (err, data) {

                            if (err) {
                                return cb.expect(2)(err);
                            }

                            cb.expect(2)(null, plist.parse(data.toString()));
                        });

                    case 65:
                        _ref8 = _context2.sent;
                        _ref9 = _slicedToArray(_ref8, 2);
                        err = _ref9[0];
                        pl = _ref9[1];

                        if (!err) {
                            _context2.next = 71;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 71:

                        pl['CFBundleDisplayName'] = manifest.name;
                        pl['CFBundleName'] = manifest.name;
                        pl['CFBundleVersion'] = manifest.version;
                        pl['CFBundleShortVersionString'] = manifest.version;
                        pl['CFBundleIdentifier'] = 'io.nwjs-builder.' + manifest.name.toLowerCase();

                        _context2.next = 78;
                        return writeFile(infoFile, plist.build(pl), cb.single);

                    case 78:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 81;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 81:
                        if (!macIcns) {
                            _context2.next = 88;
                            break;
                        }

                        console.log(majorIdx++ + ': Copy .icns to ' + buildDir);

                        _context2.next = 85;
                        return copy(macIcns, join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.icns'), cb.single);

                    case 85:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 88;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 88:
                        newName = manifest.name + '.app';


                        console.log(majorIdx++ + ': Rename application to ' + newName);

                        _context2.next = 92;
                        return rename(join(this.buildDir, 'nwjs.app'), join(this.buildDir, newName), cb.single);

                    case 92:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 95;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 95:

                        console.log(majorIdx++ + ': Done');

                        callback(null, this.buildDir);

                    case 97:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }).bind(context));
};

module.exports = BuildDarwinBinary;