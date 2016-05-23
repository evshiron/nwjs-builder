
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('path');

var dirname = _require.dirname;
var join = _require.join;
var resolve = _require.resolve;

var _require2 = require('fs');

var writeFile = _require2.writeFile;
var readFile = _require2.readFile;
var rename = _require2.rename;

var _require3 = require('fs-extra');

var readJson = _require3.readJson;
var emptyDir = _require3.emptyDir;
var copy = _require3.copy;
var remove = _require3.remove;

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
    var _ref$includes = _ref.includes;
    var includes = _ref$includes === undefined ? null : _ref$includes;
    var _ref$withFFmpeg = _ref.withFFmpeg;
    var withFFmpeg = _ref$withFFmpeg === undefined ? false : _ref$withFFmpeg;
    var _ref$sideBySide = _ref.sideBySide;
    var sideBySide = _ref$sideBySide === undefined ? false : _ref$sideBySide;
    var _ref$production = _ref.production;
    var production = _ref$production === undefined ? false : _ref$production;
    var _ref$macIcns = _ref.macIcns;
    var macIcns = _ref$macIcns === undefined ? null : _ref$macIcns;


    var context = {};

    Flow(regeneratorRuntime.mark(function _callee3(cb) {
        var _this = this;

        var majorIdx, err, manifest, _ref2, _ref3, _err, _ref4, _ref5, _ret, _ret2, _err2, workingDir, _ref10, _ref11, _err3, stdout, stderr, nodeModules, _ref12, _ref13, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, src, gl, dest, _err4, files, srcDir, destDir, _ref14, _ref15, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, _src, _dest, _err5, pl, infoFile, _ref16, _ref17, _err6, _err7, _err8, newName;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        majorIdx = 0;
                        err = void 0, manifest = void 0;


                        console.log(majorIdx++ + ': Read package.json');

                        _context3.next = 5;
                        return readJson(join(path, 'package.json'), cb.expect(2));

                    case 5:
                        _ref2 = _context3.sent;
                        _ref3 = _slicedToArray(_ref2, 2);
                        err = _ref3[0];
                        manifest = _ref3[1];

                        if (!err) {
                            _context3.next = 11;
                            break;
                        }

                        return _context3.abrupt('return', callback(err));

                    case 11:

                        this.manifest = manifest;
                        this.target = NWD.GetTarget(platform, arch);
                        this.buildName = manifest.name + '-' + this.target;
                        this.buildDir = outputDir ? join(outputDir, this.buildName) : join(dirname(path), this.buildName);

                        _err = void 0;


                        console.log(majorIdx++ + ': Prepare build directory at ' + this.buildDir);

                        _context3.next = 19;
                        return emptyDir(this.buildDir, cb.expect(2));

                    case 19:
                        _ref4 = _context3.sent;
                        _ref5 = _slicedToArray(_ref4, 1);
                        _err = _ref5[0];

                        if (!_err) {
                            _context3.next = 24;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err));

                    case 24:
                        return _context3.delegateYield(regeneratorRuntime.mark(function _callee() {
                            var err, REGEX_FILTER_I18N;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            err = void 0;


                                            console.log(majorIdx++ + ': Copy binary from ' + binaryDir);

                                            REGEX_FILTER_I18N = /\/nwjs\.app\/Contents\/Resources\/[a-zA-Z0-9_]+\.lproj/;
                                            _context.next = 5;
                                            return copy(binaryDir, _this.buildDir, {
                                                // Ignore i18n files.
                                                filter: function filter(path) {
                                                    return !REGEX_FILTER_I18N.test(path);
                                                }
                                            }, cb.single);

                                        case 5:
                                            err = _context.sent;

                                            if (!err) {
                                                _context.next = 8;
                                                break;
                                            }

                                            return _context.abrupt('return', {
                                                v: callback(err)
                                            });

                                        case 8:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, _this);
                        })(), 't0', 25);

                    case 25:
                        _ret = _context3.t0;

                        if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                            _context3.next = 28;
                            break;
                        }

                        return _context3.abrupt('return', _ret.v);

                    case 28:
                        if (!withFFmpeg) {
                            _context3.next = 33;
                            break;
                        }

                        return _context3.delegateYield(regeneratorRuntime.mark(function _callee2() {
                            var err, tempDir, _ref6, _ref7, _ref8, _ref9;

                            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                while (1) {
                                    switch (_context2.prev = _context2.next) {
                                        case 0:
                                            err = void 0, tempDir = void 0;


                                            console.log(majorIdx++ + ': Install ffmpeg for nw.js ' + version);

                                            // Make a temporary directory.

                                            _context2.next = 4;
                                            return temp.mkdir(null, cb.expect(2));

                                        case 4:
                                            _ref6 = _context2.sent;
                                            _ref7 = _slicedToArray(_ref6, 2);
                                            err = _ref7[0];
                                            tempDir = _ref7[1];

                                            if (!err) {
                                                _context2.next = 10;
                                                break;
                                            }

                                            return _context2.abrupt('return', {
                                                v: callback(err)
                                            });

                                        case 10:
                                            _context2.next = 12;
                                            return NWB.DownloadAndExtractFFmpeg(tempDir, {
                                                version: version, platform: platform, arch: arch
                                            }, cb.expect(3));

                                        case 12:
                                            _ref8 = _context2.sent;
                                            _ref9 = _slicedToArray(_ref8, 2);
                                            err = _ref9[0];

                                            if (!err) {
                                                _context2.next = 17;
                                                break;
                                            }

                                            return _context2.abrupt('return', {
                                                v: callback(err)
                                            });

                                        case 17:
                                            _context2.next = 19;
                                            return glob(join(_this.buildDir, 'nwjs.app/**/libffmpeg.dylib'), {}, function (err, files) {

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

                                        case 19:
                                            err = _context2.sent;

                                            if (!err) {
                                                _context2.next = 22;
                                                break;
                                            }

                                            return _context2.abrupt('return', {
                                                v: callback(err)
                                            });

                                        case 22:
                                        case 'end':
                                            return _context2.stop();
                                    }
                                }
                            }, _callee2, _this);
                        })(), 't1', 30);

                    case 30:
                        _ret2 = _context3.t1;

                        if (!((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object")) {
                            _context3.next = 33;
                            break;
                        }

                        return _context3.abrupt('return', _ret2.v);

                    case 33:
                        _err2 = void 0, workingDir = void 0;


                        console.log(majorIdx++ + ': Make working directory');

                        _context3.next = 37;
                        return temp.mkdir(null, cb.expect(2));

                    case 37:
                        _ref10 = _context3.sent;
                        _ref11 = _slicedToArray(_ref10, 2);
                        _err2 = _ref11[0];
                        workingDir = _ref11[1];

                        if (!_err2) {
                            _context3.next = 43;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err2));

                    case 43:
                        _context3.next = 45;
                        return copy(path, workingDir, cb.single);

                    case 45:
                        _err2 = _context3.sent;

                        if (!_err2) {
                            _context3.next = 48;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err2));

                    case 48:

                        this.workingDir = workingDir;

                        if (!production) {
                            _context3.next = 69;
                            break;
                        }

                        _err3 = void 0, stdout = void 0, stderr = void 0;
                        nodeModules = join(this.workingDir, 'node_modules');


                        console.log(majorIdx++ + ': Remove node_modules at ' + nodeModules);

                        _context3.next = 55;
                        return remove(nodeModules, cb.single);

                    case 55:
                        _err3 = _context3.sent;

                        if (!_err3) {
                            _context3.next = 58;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err3));

                    case 58:

                        console.log(majorIdx++ + ': Execute npm install at ' + this.workingDir);

                        _context3.next = 61;
                        return exec('npm install', {
                            cwd: this.workingDir
                        }, cb.expect(3));

                    case 61:
                        _ref12 = _context3.sent;
                        _ref13 = _slicedToArray(_ref12, 3);
                        _err3 = _ref13[0];
                        stdout = _ref13[1];
                        stderr = _ref13[2];

                        if (!_err3) {
                            _context3.next = 68;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err3));

                    case 68:

                        //console.log(stdout);
                        console.log(stderr);

                    case 69:
                        if (!includes) {
                            _context3.next = 140;
                            break;
                        }

                        console.log(majorIdx++ + ': Copy included files to ' + this.workingDir);

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 74;
                        _iterator = includes[Symbol.iterator]();

                    case 76:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context3.next = 126;
                            break;
                        }

                        _step$value = _slicedToArray(_step.value, 3);
                        src = _step$value[0];
                        gl = _step$value[1];
                        dest = _step$value[2];
                        _err4 = void 0, files = void 0;
                        srcDir = resolve(src);
                        destDir = resolve(join(this.workingDir, dest));
                        _context3.next = 86;
                        return glob(gl, {
                            cwd: srcDir
                        }, cb.expect(2));

                    case 86:
                        _ref14 = _context3.sent;
                        _ref15 = _slicedToArray(_ref14, 2);
                        _err4 = _ref15[0];
                        files = _ref15[1];

                        if (!_err4) {
                            _context3.next = 92;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err4));

                    case 92:
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context3.prev = 95;
                        _iterator2 = files[Symbol.iterator]();

                    case 97:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context3.next = 109;
                            break;
                        }

                        file = _step2.value;
                        _src = resolve(join(srcDir, file));
                        _dest = resolve(join(destDir, file));
                        _context3.next = 103;
                        return copy(_src, _dest, cb.single);

                    case 103:
                        _err4 = _context3.sent;

                        if (!_err4) {
                            _context3.next = 106;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err4));

                    case 106:
                        _iteratorNormalCompletion2 = true;
                        _context3.next = 97;
                        break;

                    case 109:
                        _context3.next = 115;
                        break;

                    case 111:
                        _context3.prev = 111;
                        _context3.t2 = _context3['catch'](95);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context3.t2;

                    case 115:
                        _context3.prev = 115;
                        _context3.prev = 116;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 118:
                        _context3.prev = 118;

                        if (!_didIteratorError2) {
                            _context3.next = 121;
                            break;
                        }

                        throw _iteratorError2;

                    case 121:
                        return _context3.finish(118);

                    case 122:
                        return _context3.finish(115);

                    case 123:
                        _iteratorNormalCompletion = true;
                        _context3.next = 76;
                        break;

                    case 126:
                        _context3.next = 132;
                        break;

                    case 128:
                        _context3.prev = 128;
                        _context3.t3 = _context3['catch'](74);
                        _didIteratorError = true;
                        _iteratorError = _context3.t3;

                    case 132:
                        _context3.prev = 132;
                        _context3.prev = 133;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 135:
                        _context3.prev = 135;

                        if (!_didIteratorError) {
                            _context3.next = 138;
                            break;
                        }

                        throw _iteratorError;

                    case 138:
                        return _context3.finish(135);

                    case 139:
                        return _context3.finish(132);

                    case 140:
                        _err5 = void 0, pl = void 0;
                        infoFile = join(this.buildDir, 'nwjs.app', 'Contents', 'Info.plist');


                        console.log(majorIdx++ + ': Modify Info.plist at ' + infoFile);

                        _context3.next = 145;
                        return readFile(infoFile, {
                            encoding: 'utf-8'
                        }, function (err, data) {

                            if (err) {
                                return cb.expect(2)(err);
                            }

                            cb.expect(2)(null, plist.parse(data.toString()));
                        });

                    case 145:
                        _ref16 = _context3.sent;
                        _ref17 = _slicedToArray(_ref16, 2);
                        _err5 = _ref17[0];
                        pl = _ref17[1];

                        if (!_err5) {
                            _context3.next = 151;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err5));

                    case 151:

                        pl['CFBundleDisplayName'] = this.manifest.name;
                        pl['CFBundleName'] = this.manifest.name;
                        pl['CFBundleVersion'] = this.manifest.version;
                        pl['CFBundleShortVersionString'] = this.manifest.version;
                        pl['CFBundleIdentifier'] = 'io.nwjs-builder.' + this.manifest.name.toLowerCase();

                        _context3.next = 158;
                        return writeFile(infoFile, plist.build(pl), cb.single);

                    case 158:
                        _err5 = _context3.sent;

                        if (!_err5) {
                            _context3.next = 161;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err5));

                    case 161:
                        if (!macIcns) {
                            _context3.next = 169;
                            break;
                        }

                        _err6 = void 0;


                        console.log(majorIdx++ + ': Copy .icns to ' + this.buildDir);

                        _context3.next = 166;
                        return copy(macIcns, join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.icns'), cb.single);

                    case 166:
                        _err6 = _context3.sent;

                        if (!_err6) {
                            _context3.next = 169;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err6));

                    case 169:
                        _err7 = void 0;


                        console.log(majorIdx++ + ': Copy application from ' + this.workingDir);

                        _context3.next = 173;
                        return copy(this.workingDir, join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw'), cb.single);

                    case 173:
                        _err7 = _context3.sent;

                        if (!_err7) {
                            _context3.next = 176;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err7));

                    case 176:
                        _err8 = void 0;
                        newName = this.manifest.name + '.app';


                        console.log(majorIdx++ + ': Rename application to ' + newName);

                        _context3.next = 181;
                        return rename(join(this.buildDir, 'nwjs.app'), join(this.buildDir, newName), cb.single);

                    case 181:
                        _err8 = _context3.sent;

                        if (!_err8) {
                            _context3.next = 184;
                            break;
                        }

                        return _context3.abrupt('return', callback(_err8));

                    case 184:

                        console.log(majorIdx++ + ': Done');

                        callback(null, this.buildDir);

                    case 186:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[74, 128, 132, 140], [95, 111, 115, 123], [116,, 118, 122], [133,, 135, 139]]);
    }).bind(context));
};

module.exports = BuildDarwinBinary;