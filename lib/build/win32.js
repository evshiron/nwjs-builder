
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('path');

var dirname = _require.dirname;
var join = _require.join;
var resolve = _require.resolve;

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

var glob = require('glob');

var rcedit = require('rcedit');

var Flow = require('node-flow');

var NWD = require('nwjs-download');

var NWB = require('../../');

var BuildWin32Binary = function BuildWin32Binary(path, binaryDir, version, platform, arch, _ref, callback) {
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
    var _ref$winIco = _ref.winIco;
    var winIco = _ref$winIco === undefined ? null : _ref$winIco;


    var context = {};

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var majorIdx, err, manifest, _ref2, _ref3, _err, _ref4, _ref5, _err2, _err3, rcOptions, properties, _err4, tempDir, _ref6, _ref7, _ref8, _ref9, _err5, workingDir, _ref10, _ref11, _err6, stdout, stderr, nodeModules, _ref12, _ref13, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, src, gl, dest, _err7, files, srcDir, destDir, _ref14, _ref15, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, _src, _dest, _err8, _err9, nwFile, _ref16, _ref17, executable, _err10, newName;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        majorIdx = 0;
                        err = void 0, manifest = void 0;


                        console.log(majorIdx++ + ': Read package.json');

                        _context.next = 5;
                        return readJson(join(path, 'package.json'), cb.expect(2));

                    case 5:
                        _ref2 = _context.sent;
                        _ref3 = _slicedToArray(_ref2, 2);
                        err = _ref3[0];
                        manifest = _ref3[1];

                        if (!err) {
                            _context.next = 11;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 11:

                        this.manifest = manifest;
                        this.target = NWD.GetTarget(platform, arch);
                        this.buildName = manifest.name + '-' + this.target;
                        this.buildDir = outputDir ? join(outputDir, this.buildName) : join(dirname(path), this.buildName);

                        _err = void 0;


                        console.log(majorIdx++ + ': Prepare build directory at ' + this.buildDir);

                        _context.next = 19;
                        return emptyDir(this.buildDir, cb.expect(2));

                    case 19:
                        _ref4 = _context.sent;
                        _ref5 = _slicedToArray(_ref4, 1);
                        _err = _ref5[0];

                        if (!_err) {
                            _context.next = 24;
                            break;
                        }

                        return _context.abrupt('return', callback(_err));

                    case 24:
                        _err2 = void 0;


                        console.log(majorIdx++ + ': Copy binary from ' + binaryDir);

                        _context.next = 28;
                        return copy(binaryDir, this.buildDir, {}, cb.single);

                    case 28:
                        _err2 = _context.sent;

                        if (!_err2) {
                            _context.next = 31;
                            break;
                        }

                        return _context.abrupt('return', callback(_err2));

                    case 31:
                        _err3 = void 0;


                        console.log(majorIdx++ + ': Edit Windows executable');

                        rcOptions = {
                            'version-string': {
                                // Comments: undefined,
                                // CompanyName: undefined,
                                // FileDescription: manifest.description,
                                // FileVersion: manifest.version,
                                // InternalName: undefined,
                                // LegalCopyright: undefined,
                                // LegalTrademarks: undefined,
                                // OriginalFilename: undefined,
                                // PrivateBuild: undefined,
                                // ProductName: manifest.name,
                                // ProductVersion: manifest.version,
                                // SpecialBuild: undefined,
                            },
                            'icon': winIco ? winIco : null
                        };


                        if (this.manifest.name) {
                            rcOptions['version-string'].ProductName = this.manifest.name;
                        }

                        if (this.manifest.version) {
                            rcOptions['product-version'] = this.manifest.version;
                        }

                        if (this.manifest.description) {
                            rcOptions['version-string'].FileDescription = this.manifest.description;
                        }

                        if (this.manifest.nwjsBuilder) {
                            properties = this.manifest.nwjsBuilder;


                            if (properties.copyright) {
                                rcOptions['version-string'].LegalCopyright = properties.copyright;
                            }

                            if (properties.internalName) {
                                rcOptions['version-string'].InternalName = properties.internalName;
                            }

                            if (properties.fileVersion) {
                                rcOptions['file-version'] = properties.fileVersion;
                            }

                            if (properties.comments) {
                                rcOptions['version-string'].Comments = properties.comments;
                            }

                            if (properties.companyName) {
                                rcOptions['version-string'].CompanyName = properties.companyName;
                            }

                            if (properties.legalTrademarks) {
                                rcOptions['version-string'].LegalTrademarks = properties.legalTrademarks;
                            }

                            if (properties.originalFilename) {
                                rcOptions['version-string'].OriginalFilename = properties.originalFilename;
                            }

                            if (properties.privateBuild) {
                                rcOptions['version-string'].PrivateBuild = properties.privateBuild;
                            }

                            if (properties.specialBuild) {
                                rcOptions['version-string'].SpecialBuild = properties.specialBuild;
                            }
                        }

                        _context.next = 40;
                        return rcedit(join(this.buildDir, 'nw.exe'), rcOptions, cb.single);

                    case 40:
                        _err3 = _context.sent;

                        if (!_err3) {
                            _context.next = 43;
                            break;
                        }

                        return _context.abrupt('return', callback(_err3));

                    case 43:
                        if (!withFFmpeg) {
                            _context.next = 66;
                            break;
                        }

                        _err4 = void 0, tempDir = void 0;


                        console.log(majorIdx++ + ': Install ffmpeg for nw.js ' + version);

                        // Make a temporary directory.

                        _context.next = 48;
                        return temp.mkdir(null, cb.expect(2));

                    case 48:
                        _ref6 = _context.sent;
                        _ref7 = _slicedToArray(_ref6, 2);
                        _err4 = _ref7[0];
                        tempDir = _ref7[1];

                        if (!_err4) {
                            _context.next = 54;
                            break;
                        }

                        return _context.abrupt('return', callback(_err4));

                    case 54:
                        _context.next = 56;
                        return NWB.DownloadAndExtractFFmpeg(tempDir, {
                            version: version, platform: platform, arch: arch
                        }, cb.expect(3));

                    case 56:
                        _ref8 = _context.sent;
                        _ref9 = _slicedToArray(_ref8, 2);
                        _err4 = _ref9[0];

                        if (!_err4) {
                            _context.next = 61;
                            break;
                        }

                        return _context.abrupt('return', callback(_err4));

                    case 61:
                        _context.next = 63;
                        return copy(join(tempDir, 'ffmpeg.dll'), join(this.buildDir, 'ffmpeg.dll'), {
                            clobber: true
                        }, cb.single);

                    case 63:
                        _err4 = _context.sent;

                        if (!_err4) {
                            _context.next = 66;
                            break;
                        }

                        return _context.abrupt('return', callback(_err4));

                    case 66:
                        _err5 = void 0, workingDir = void 0;


                        console.log(majorIdx++ + ': Make working directory');

                        _context.next = 70;
                        return temp.mkdir(null, cb.expect(2));

                    case 70:
                        _ref10 = _context.sent;
                        _ref11 = _slicedToArray(_ref10, 2);
                        _err5 = _ref11[0];
                        workingDir = _ref11[1];

                        if (!_err5) {
                            _context.next = 76;
                            break;
                        }

                        return _context.abrupt('return', callback(_err5));

                    case 76:
                        _context.next = 78;
                        return copy(path, workingDir, cb.single);

                    case 78:
                        _err5 = _context.sent;

                        if (!_err5) {
                            _context.next = 81;
                            break;
                        }

                        return _context.abrupt('return', callback(_err5));

                    case 81:

                        this.workingDir = workingDir;

                        if (!production) {
                            _context.next = 102;
                            break;
                        }

                        _err6 = void 0, stdout = void 0, stderr = void 0;
                        nodeModules = join(this.workingDir, 'node_modules');


                        console.log(majorIdx++ + ': Remove node_modules at ' + nodeModules);

                        _context.next = 88;
                        return remove(nodeModules, cb.single);

                    case 88:
                        _err6 = _context.sent;

                        if (!_err6) {
                            _context.next = 91;
                            break;
                        }

                        return _context.abrupt('return', callback(_err6));

                    case 91:

                        console.log(majorIdx++ + ': Execute npm install at ' + this.workingDir);

                        _context.next = 94;
                        return exec('npm install', {
                            cwd: this.workingDir
                        }, cb.expect(3));

                    case 94:
                        _ref12 = _context.sent;
                        _ref13 = _slicedToArray(_ref12, 3);
                        _err6 = _ref13[0];
                        stdout = _ref13[1];
                        stderr = _ref13[2];

                        if (!_err6) {
                            _context.next = 101;
                            break;
                        }

                        return _context.abrupt('return', callback(_err6));

                    case 101:

                        //console.log(stdout);
                        console.log(stderr);

                    case 102:
                        if (!includes) {
                            _context.next = 173;
                            break;
                        }

                        console.log(majorIdx++ + ': Copy included files to ' + this.workingDir);

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 107;
                        _iterator = includes[Symbol.iterator]();

                    case 109:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 159;
                            break;
                        }

                        _step$value = _slicedToArray(_step.value, 3);
                        src = _step$value[0];
                        gl = _step$value[1];
                        dest = _step$value[2];
                        _err7 = void 0, files = void 0;
                        srcDir = resolve(src);
                        destDir = resolve(join(this.workingDir, dest));
                        _context.next = 119;
                        return glob(gl, {
                            cwd: srcDir
                        }, cb.expect(2));

                    case 119:
                        _ref14 = _context.sent;
                        _ref15 = _slicedToArray(_ref14, 2);
                        _err7 = _ref15[0];
                        files = _ref15[1];

                        if (!_err7) {
                            _context.next = 125;
                            break;
                        }

                        return _context.abrupt('return', callback(_err7));

                    case 125:
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 128;
                        _iterator2 = files[Symbol.iterator]();

                    case 130:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 142;
                            break;
                        }

                        file = _step2.value;
                        _src = resolve(join(srcDir, file));
                        _dest = resolve(join(destDir, file));
                        _context.next = 136;
                        return copy(_src, _dest, cb.single);

                    case 136:
                        _err7 = _context.sent;

                        if (!_err7) {
                            _context.next = 139;
                            break;
                        }

                        return _context.abrupt('return', callback(_err7));

                    case 139:
                        _iteratorNormalCompletion2 = true;
                        _context.next = 130;
                        break;

                    case 142:
                        _context.next = 148;
                        break;

                    case 144:
                        _context.prev = 144;
                        _context.t0 = _context['catch'](128);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t0;

                    case 148:
                        _context.prev = 148;
                        _context.prev = 149;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 151:
                        _context.prev = 151;

                        if (!_didIteratorError2) {
                            _context.next = 154;
                            break;
                        }

                        throw _iteratorError2;

                    case 154:
                        return _context.finish(151);

                    case 155:
                        return _context.finish(148);

                    case 156:
                        _iteratorNormalCompletion = true;
                        _context.next = 109;
                        break;

                    case 159:
                        _context.next = 165;
                        break;

                    case 161:
                        _context.prev = 161;
                        _context.t1 = _context['catch'](107);
                        _didIteratorError = true;
                        _iteratorError = _context.t1;

                    case 165:
                        _context.prev = 165;
                        _context.prev = 166;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 168:
                        _context.prev = 168;

                        if (!_didIteratorError) {
                            _context.next = 171;
                            break;
                        }

                        throw _iteratorError;

                    case 171:
                        return _context.finish(168);

                    case 172:
                        return _context.finish(165);

                    case 173:
                        if (!sideBySide) {
                            _context.next = 183;
                            break;
                        }

                        _err8 = void 0;


                        console.log(majorIdx++ + ': Copy application from ' + this.workingDir);

                        _context.next = 178;
                        return copy(this.workingDir, this.buildDir, cb.single);

                    case 178:
                        _err8 = _context.sent;

                        if (!_err8) {
                            _context.next = 181;
                            break;
                        }

                        return _context.abrupt('return', callback(_err8));

                    case 181:
                        _context.next = 200;
                        break;

                    case 183:
                        _err9 = void 0, nwFile = void 0;


                        console.log(majorIdx++ + ': Compress application');

                        _context.next = 187;
                        return NWB.util.ZipDirectory(this.workingDir, [], temp.path(), cb.expect(2));

                    case 187:
                        _ref16 = _context.sent;
                        _ref17 = _slicedToArray(_ref16, 2);
                        _err9 = _ref17[0];
                        nwFile = _ref17[1];

                        if (!_err9) {
                            _context.next = 193;
                            break;
                        }

                        return _context.abrupt('return', callback(_err9));

                    case 193:
                        executable = NWB.GetExecutable(this.buildDir, this.target);


                        console.log(majorIdx++ + ': Combine executable at ' + executable);

                        _context.next = 197;
                        return NWB.util.CombineExecutable(executable, nwFile, cb.single);

                    case 197:
                        _err9 = _context.sent;

                        if (!_err9) {
                            _context.next = 200;
                            break;
                        }

                        return _context.abrupt('return', callback(_err9));

                    case 200:
                        _err10 = void 0;
                        newName = this.manifest.name + '.exe';


                        console.log(majorIdx++ + ': Rename application to ' + newName);

                        _context.next = 205;
                        return rename(join(this.buildDir, 'nw.exe'), join(this.buildDir, newName), cb.single);

                    case 205:
                        _err10 = _context.sent;

                        if (!_err10) {
                            _context.next = 208;
                            break;
                        }

                        return _context.abrupt('return', callback(_err10));

                    case 208:

                        console.log(majorIdx++ + ': Done');

                        callback(null, this.buildDir);

                    case 210:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[107, 161, 165, 173], [128, 144, 148, 156], [149,, 151, 155], [166,, 168, 172]]);
    }).bind(context));
};

module.exports = BuildWin32Binary;