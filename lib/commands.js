
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('path');

var resolve = _require.resolve;

var _require2 = require('./nwbuild');

var ParseNwBuilderVersion = _require2.ParseNwBuilderVersion;


var NWD = require('nwjs-download');

var Flow = require('node-flow');

var NWB = require('../');

var NwBuilderBuild = function NwBuilderBuild(path, command, callback) {

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var options, _ref, _ref2, err, version, flavor, parts, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, platform, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, target, _target, _platform, arch, params, _ref3, _ref4, _err, fromCache, fromDone, binaryDir, _ref5, _ref6, _err2, _path, _ref7, _ref8, _err3, _path2, _ref9, _ref10, _err4, _path3;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        options = {
                            version: null,
                            flavor: null,
                            targets: [],
                            path: null,
                            mirror: null
                        };
                        _context.next = 3;
                        return ParseNwBuilderVersion(command.version, cb.expect(3));

                    case 3:
                        _ref = _context.sent;
                        _ref2 = _slicedToArray(_ref, 3);
                        err = _ref2[0];
                        version = _ref2[1];
                        flavor = _ref2[2];

                        if (!err) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 10:

                        options.version = version;
                        options.flavor = flavor;
                        options.mirror = command.mirror;

                        if (!command.platforms) {
                            _context.next = 59;
                            break;
                        }

                        parts = command.platforms.split(',');
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 18;
                        _iterator = parts[Symbol.iterator]();

                    case 20:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 43;
                            break;
                        }

                        platform = _step.value;
                        _context.t0 = platform;
                        _context.next = _context.t0 === 'win32' ? 25 : _context.t0 === 'win64' ? 27 : _context.t0 === 'linux32' ? 29 : _context.t0 === 'linux64' ? 31 : _context.t0 === 'osx32' ? 33 : _context.t0 === 'osx64' ? 35 : 37;
                        break;

                    case 25:
                        options.targets.push(['win', 'x86']);
                        return _context.abrupt('break', 40);

                    case 27:
                        options.targets.push(['win', 'x64']);
                        return _context.abrupt('break', 40);

                    case 29:
                        options.targets.push(['linux', 'x86']);
                        return _context.abrupt('break', 40);

                    case 31:
                        options.targets.push(['linux', 'x64']);
                        return _context.abrupt('break', 40);

                    case 33:
                        options.targets.push(['osx', 'x86']);
                        return _context.abrupt('break', 40);

                    case 35:
                        options.targets.push(['osx', 'x64']);
                        return _context.abrupt('break', 40);

                    case 37:
                        console.warn('WARN_PLATFORM_UNRECOGNIZED');
                        console.warn('platform:', platform);
                        return _context.abrupt('break', 40);

                    case 40:
                        _iteratorNormalCompletion = true;
                        _context.next = 20;
                        break;

                    case 43:
                        _context.next = 49;
                        break;

                    case 45:
                        _context.prev = 45;
                        _context.t1 = _context['catch'](18);
                        _didIteratorError = true;
                        _iteratorError = _context.t1;

                    case 49:
                        _context.prev = 49;
                        _context.prev = 50;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 52:
                        _context.prev = 52;

                        if (!_didIteratorError) {
                            _context.next = 55;
                            break;
                        }

                        throw _iteratorError;

                    case 55:
                        return _context.finish(52);

                    case 56:
                        return _context.finish(49);

                    case 57:
                        _context.next = 60;
                        break;

                    case 59:

                        options.targets.push([process.platform, process.arch]);

                    case 60:

                        options.path = path ? path : '.';

                        console.log(options);

                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 65;
                        _iterator2 = options.targets[Symbol.iterator]();

                    case 67:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 120;
                            break;
                        }

                        target = _step2.value;
                        _target = _slicedToArray(target, 2);
                        _platform = _target[0];
                        arch = _target[1];
                        params = {
                            version: options.version,
                            platform: _platform,
                            arch: arch,
                            flavor: options.flavor
                        };
                        _context.next = 75;
                        return NWB.DownloadAndExtractBinary({
                            version: options.version,
                            platform: _platform,
                            arch: arch,
                            flavor: options.flavor,
                            mirror: options.mirror
                        }, cb.expect(4));

                    case 75:
                        _ref3 = _context.sent;
                        _ref4 = _slicedToArray(_ref3, 4);
                        _err = _ref4[0];
                        fromCache = _ref4[1];
                        fromDone = _ref4[2];
                        binaryDir = _ref4[3];

                        if (!_err) {
                            _context.next = 83;
                            break;
                        }

                        return _context.abrupt('return', callback(_err));

                    case 83:
                        _context.t2 = NWD.GetPlatform(_platform);
                        _context.next = _context.t2 === 'win32' ? 86 : _context.t2 === 'linux' ? 96 : _context.t2 === 'darwin' ? 106 : 116;
                        break;

                    case 86:
                        _context.next = 88;
                        return NWB.BuildWin32Binary(options.path, binaryDir, options.version, NWD.GetPlatform(_platform), NWD.GetArch(arch), {
                            outputDir: command.outputDir ? command.outputDir : null,
                            includes: command.include ? command.include : null,
                            withFFmpeg: command.withFfmpeg ? true : false,
                            sideBySide: command.sideBySide ? true : false,
                            production: command.production ? true : false,
                            winIco: command.winIco ? command.winIco : null
                        }, cb.expect(2));

                    case 88:
                        _ref5 = _context.sent;
                        _ref6 = _slicedToArray(_ref5, 2);
                        _err2 = _ref6[0];
                        _path = _ref6[1];

                        if (!_err2) {
                            _context.next = 94;
                            break;
                        }

                        return _context.abrupt('return', callback(_err2));

                    case 94:

                        console.log(NWD.GetTarget(_platform, arch) + ' build: ' + resolve(_path) + '.');

                        return _context.abrupt('break', 116);

                    case 96:
                        _context.next = 98;
                        return NWB.BuildLinuxBinary(options.path, binaryDir, options.version, NWD.GetPlatform(_platform), NWD.GetArch(arch), {
                            outputDir: command.outputDir ? command.outputDir : null,
                            includes: command.include ? command.include : null,
                            withFFmpeg: command.withFfmpeg ? true : false,
                            sideBySide: command.sideBySide ? true : false,
                            production: command.production ? true : false
                        }, cb.expect(2));

                    case 98:
                        _ref7 = _context.sent;
                        _ref8 = _slicedToArray(_ref7, 2);
                        _err3 = _ref8[0];
                        _path2 = _ref8[1];

                        if (!_err3) {
                            _context.next = 104;
                            break;
                        }

                        return _context.abrupt('return', callback(_err3));

                    case 104:

                        console.log(NWD.GetTarget(_platform, arch) + ' build: ' + resolve(_path2) + '.');

                        return _context.abrupt('break', 116);

                    case 106:
                        _context.next = 108;
                        return NWB.BuildDarwinBinary(options.path, binaryDir, options.version, NWD.GetPlatform(_platform), NWD.GetArch(arch), {
                            outputDir: command.outputDir ? command.outputDir : null,
                            includes: command.include ? command.include : null,
                            withFFmpeg: command.withFfmpeg ? true : false,
                            sideBySide: command.sideBySide ? true : false,
                            production: command.production ? true : false,
                            macIcns: command.macIcns ? command.macIcns : null
                        }, cb.expect(2));

                    case 108:
                        _ref9 = _context.sent;
                        _ref10 = _slicedToArray(_ref9, 2);
                        _err4 = _ref10[0];
                        _path3 = _ref10[1];

                        if (!_err4) {
                            _context.next = 114;
                            break;
                        }

                        return _context.abrupt('return', callback(_err4));

                    case 114:

                        console.log(NWD.GetTarget(_platform, arch) + ' build: ' + resolve(_path3));

                        return _context.abrupt('break', 116);

                    case 116:

                        console.log();

                    case 117:
                        _iteratorNormalCompletion2 = true;
                        _context.next = 67;
                        break;

                    case 120:
                        _context.next = 126;
                        break;

                    case 122:
                        _context.prev = 122;
                        _context.t3 = _context['catch'](65);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t3;

                    case 126:
                        _context.prev = 126;
                        _context.prev = 127;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 129:
                        _context.prev = 129;

                        if (!_didIteratorError2) {
                            _context.next = 132;
                            break;
                        }

                        throw _iteratorError2;

                    case 132:
                        return _context.finish(129);

                    case 133:
                        return _context.finish(126);

                    case 134:

                        callback(null);

                    case 135:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[18, 45, 49, 57], [50,, 52, 56], [65, 122, 126, 134], [127,, 129, 133]]);
    }));
};

var NwBuilderRun = function NwBuilderRun(path, command, callback) {

    Flow(regeneratorRuntime.mark(function _callee2(cb) {
        var options, _ref11, _ref12, err, version, flavor, _ref13, _ref14, fromCache, fromDone, binaryDir, executable, _ref15, _ref16, code;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        options = {
                            version: null,
                            platform: null,
                            arch: null,
                            flavor: null,
                            mirror: null,
                            path: null
                        };

                        // Parse platform and arch.

                        options.platform = process.platform;
                        options.arch = process.arch;

                        // Parse version.

                        _context2.next = 5;
                        return ParseNwBuilderVersion(command.version, cb.expect(3));

                    case 5:
                        _ref11 = _context2.sent;
                        _ref12 = _slicedToArray(_ref11, 3);
                        err = _ref12[0];
                        version = _ref12[1];
                        flavor = _ref12[2];

                        if (!err) {
                            _context2.next = 12;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 12:

                        options.version = version;
                        options.flavor = flavor;
                        options.mirror = command.mirror;

                        // Parse path.

                        options.path = path ? path : '.';

                        console.log(options);

                        _context2.next = 19;
                        return NWB.DownloadAndExtractBinary({
                            version: options.version,
                            platform: options.platform,
                            arch: options.arch,
                            flavor: options.flavor,
                            mirror: options.mirror
                        }, cb.expect(4));

                    case 19:
                        _ref13 = _context2.sent;
                        _ref14 = _slicedToArray(_ref13, 4);
                        err = _ref14[0];
                        fromCache = _ref14[1];
                        fromDone = _ref14[2];
                        binaryDir = _ref14[3];

                        if (!err) {
                            _context2.next = 27;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 27:
                        executable = NWB.GetExecutable(binaryDir, options.platform);
                        _context2.next = 30;
                        return NWB.LaunchExecutable(executable, options.path, cb.expect(2));

                    case 30:
                        _ref15 = _context2.sent;
                        _ref16 = _slicedToArray(_ref15, 2);
                        err = _ref16[0];
                        code = _ref16[1];

                        if (!err) {
                            _context2.next = 36;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 36:

                        console.log('nw.js exits with code ' + code + '.');

                        callback(null, code);

                    case 38:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
};

var nwbuild = function nwbuild(path, command, callback) {

    if (!callback) {

        callback = function callback(err, code) {

            if (err) {
                console.error(err);
                return;
            }

            if (command.run) {
                process.exit(code);
            } else {
                console.log('All done.');
            }
        };
    }

    if (command.run) {
        NwBuilderRun(path, command, callback);
    } else {
        NwBuilderBuild(path, command, callback);
    }
};

Object.assign(module.exports, {
    nwbuild: nwbuild
});