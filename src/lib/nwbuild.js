
'use strict';

const NWD = require('nwjs-download');

const Flow = require('node-flow');

const MatchNwBuilderVersion = (versions, nwBuilderVersion) => {

    for(let version of versions) {
        for(let flavor of version.flavors) {

            let pattern = version.version + (flavor == 'normal' ? '' : '-' + flavor);

            if('v' + nwBuilderVersion == pattern || nwBuilderVersion == pattern) {

                return [version, flavor];

            }

        }
    }

    return [null, null];

};

const ParseNwBuilderVersion = (nwBuilderVersion, callback) => {

    Flow(function*(cb) {

        // FIXME: commander has a method named "version" as well.
        if(nwBuilderVersion && typeof nwBuilderVersion == 'string') {

            let [err, versions] = yield NWD.GetVersionList(cb.expect(2));

            if(err) {
                return callback(err);
            }

            let [version, flavor] = MatchNwBuilderVersion(versions, nwBuilderVersion);

            if(!version) {

                console.error('ERROR_VERSION_NOT_FOUND');
                console.error('version:', nwBuilderVersion);
                console.error('versions:', versions.map((version) => version.version));

                return;

            }

            return callback(err, version.version, flavor);

        }
        else {

            let [err, version] = yield NWD.GetStableVersion(cb.expect(2));

            if(err) {
                return callback(err);
            }

            return callback(err, version.version, null);

        }

    });

};

Object.assign(module.exports, {
    MatchNwBuilderVersion,
    ParseNwBuilderVersion
});
