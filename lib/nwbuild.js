
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var NWD = require('nwjs-download');

var Flow = require('node-flow');

var MatchNwBuilderVersion = function MatchNwBuilderVersion(versions, nwBuilderVersion) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {

        for (var _iterator = versions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var version = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = version.flavors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var flavor = _step2.value;


                    var pattern = version.version + (flavor == 'normal' ? '' : '-' + flavor);

                    if ('v' + nwBuilderVersion == pattern || nwBuilderVersion == pattern) {

                        return [version, flavor];
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return [null, null];
};

var ParseNwBuilderVersion = function ParseNwBuilderVersion(nwBuilderVersion, callback) {

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var _ref, _ref2, err, versions, _MatchNwBuilderVersio, _MatchNwBuilderVersio2, version, flavor, _ref3, _ref4, _err, _version;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(nwBuilderVersion && typeof nwBuilderVersion == 'string')) {
                            _context.next = 21;
                            break;
                        }

                        _context.next = 3;
                        return NWD.GetVersionList(cb.expect(2));

                    case 3:
                        _ref = _context.sent;
                        _ref2 = _slicedToArray(_ref, 2);
                        err = _ref2[0];
                        versions = _ref2[1];

                        if (!err) {
                            _context.next = 9;
                            break;
                        }

                        return _context.abrupt('return', callback(err));

                    case 9:
                        _MatchNwBuilderVersio = MatchNwBuilderVersion(versions, nwBuilderVersion);
                        _MatchNwBuilderVersio2 = _slicedToArray(_MatchNwBuilderVersio, 2);
                        version = _MatchNwBuilderVersio2[0];
                        flavor = _MatchNwBuilderVersio2[1];

                        if (version) {
                            _context.next = 18;
                            break;
                        }

                        console.error('ERROR_VERSION_NOT_FOUND');
                        console.error('version:', nwBuilderVersion);
                        console.error('versions:', versions.map(function (version) {
                            return version.version;
                        }));

                        return _context.abrupt('return');

                    case 18:
                        return _context.abrupt('return', callback(err, version.version, flavor));

                    case 21:
                        _context.next = 23;
                        return NWD.GetStableVersion(cb.expect(2));

                    case 23:
                        _ref3 = _context.sent;
                        _ref4 = _slicedToArray(_ref3, 2);
                        _err = _ref4[0];
                        _version = _ref4[1];

                        if (!_err) {
                            _context.next = 29;
                            break;
                        }

                        return _context.abrupt('return', callback(_err));

                    case 29:
                        return _context.abrupt('return', callback(_err, _version.version, null));

                    case 30:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
};

Object.assign(module.exports, {
    MatchNwBuilderVersion: MatchNwBuilderVersion,
    ParseNwBuilderVersion: ParseNwBuilderVersion
});