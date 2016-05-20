
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

var rcedit = require('rcedit');

var Flow = require('node-flow');

var NWD = require('nwjs-download');

var NWB = require('../../');

var BuildWin32Binary = function BuildWin32Binary(path, binaryDir, version, platform, arch, _ref, callback) {
    var _ref$outputDir = _ref.outputDir;
    var outputDir = _ref$outputDir === undefined ? null : _ref$outputDir;
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
        var _this = this;

        var majorIdx, _ref2, _ref3, err, manifest, _ref4, _ref5, rcOptions, properties, _ref6, _ref7, workingDir, nodeModules, _ref8, _ref9, stdout, stderr, _ref10, _ref11, nwFile, executable, newName;

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
                            'icon': winIco ? winIco : undefined
                        };


                        if (manifest.name) {
                            rcOptions['version-string'].ProductName = manifest.name;
                        }

                        if (manifest.version) {
                            rcOptions['product-version'] = manifest.version;
                        }

                        if (manifest.description) {
                            rcOptions['version-string'].FileDescription = manifest.description;
                        }

                        if (manifest.nwjsBuilder) {
                            properties = manifest.nwjsBuilder;


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

                        _context.next = 36;
                        return rcedit(join(this.buildDir, 'nw.exe'), rcOptions, cb.single);

                    case 36:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 39;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 39:
                        if (!withFFmpeg) {
                            _context.next = 46;
                            break;
                        }

                        console.log(majorIdx++ + ': Install ffmpeg for nw.js ' + version);

                        // Make a temporary directory.

                        _context.next = 43;
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

                                // Overwrite ffmpeg.dll.

                                copy(join(tempDir, 'ffmpeg.dll'), join(_this.buildDir, 'ffmpeg.dll'), {
                                    clobber: true
                                }, cb.single);
                            });
                        });

                    case 43:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 46;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 46:

                        console.log(majorIdx++ + ': Make working directory');

                        _context.next = 49;
                        return temp.mkdir(null, cb.expect(2));

                    case 49:
                        _ref6 = _context.sent;
                        _ref7 = _slicedToArray(_ref6, 2);
                        err = _ref7[0];
                        workingDir = _ref7[1];

                        if (!err) {
                            _context.next = 55;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 55:
                        _context.next = 57;
                        return copy(path, workingDir, cb.single);

                    case 57:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 60;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 60:

                        this.workingDir = workingDir;

                        if (!production) {
                            _context.next = 80;
                            break;
                        }

                        nodeModules = join(this.workingDir, 'node_modules');


                        console.log(majorIdx++ + ': Remove node_modules at ' + nodeModules);

                        _context.next = 66;
                        return remove(nodeModules, cb.single);

                    case 66:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 69;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 69:

                        console.log(majorIdx++ + ': Execute npm install at ' + this.workingDir);

                        _context.next = 72;
                        return exec('npm install', {
                            cwd: this.workingDir
                        }, cb.expect(3));

                    case 72:
                        _ref8 = _context.sent;
                        _ref9 = _slicedToArray(_ref8, 3);
                        err = _ref9[0];
                        stdout = _ref9[1];
                        stderr = _ref9[2];

                        if (!err) {
                            _context.next = 79;
                            break;
                        }

                        return _context.abrupt('return', callback(er));

                    case 79:

                        //console.log(stdout);
                        console.log(stderr);

                    case 80:
                        if (!sideBySide) {
                            _context.next = 89;
                            break;
                        }

                        console.log(majorIdx++ + ': Copy application from ' + this.workingDir);

                        _context.next = 84;
                        return copy(this.workingDir, this.buildDir, cb.single);

                    case 84:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 87;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 87:
                        _context.next = 105;
                        break;

                    case 89:

                        console.log(majorIdx++ + ': Compress application');

                        _context.next = 92;
                        return NWB.util.ZipDirectory(this.workingDir, [], temp.path(), cb.expect(2));

                    case 92:
                        _ref10 = _context.sent;
                        _ref11 = _slicedToArray(_ref10, 2);
                        err = _ref11[0];
                        nwFile = _ref11[1];

                        if (!err) {
                            _context.next = 98;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 98:
                        executable = NWB.GetExecutable(this.buildDir, this.target);


                        console.log(majorIdx++ + ': Combine executable at ' + executable);

                        _context.next = 102;
                        return NWB.util.CombineExecutable(executable, nwFile, cb.single);

                    case 102:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 105;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 105:
                        newName = manifest.name + '.exe';


                        console.log(majorIdx++ + ': Rename application to ' + newName);

                        _context.next = 109;
                        return rename(join(this.buildDir, 'nw.exe'), join(this.buildDir, newName), cb.single);

                    case 109:
                        err = _context.sent;

                        if (!err) {
                            _context.next = 112;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 112:

                        console.log(majorIdx++ + ': Done');

                        callback(null, this.buildDir);

                    case 114:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }).bind(context));
};

module.exports = BuildWin32Binary;