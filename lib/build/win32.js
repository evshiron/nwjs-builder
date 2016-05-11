
'use strict';

const { dirname, join } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy } = require('fs-extra');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildWin32Binary = (path, binaryDir, version, platform, arch, {
    withFFmpeg = false
}, callback) => {

    Flow(function*(cb) {

        var [err, manifest] = yield readJson(join(path, 'package.json'), cb.expect(2));

        if(err) {
            return callback(err);
        }

        const target = NWD.GetTarget(platform, arch);

        const name = manifest.name + '-' + target;
        const buildDir = join(dirname(path), name);

        console.log('Create build directory:', buildDir);

        var [err,] = yield emptyDir(buildDir, cb.expect(2));

        if(err) {
            return callback(err);
        }

        console.log('Copy binary from:', binaryDir);

        var err = yield copy(binaryDir, buildDir, {}, cb.single);

        if(err) {
            return callback(err);
        }

        if(withFFmpeg) {

            console.log('Copy ffmpeg:', version);

            let err = yield NWB.DownloadAndExtractFFmpeg(buildDir, {
                version, platform, arch
            }, (err, fromCache, fromDone, destination) => {

                if(err) {
                    return cb.single(err);
                }

                cb.single(null);

            });

            if(err) {
                return callback(err);
            }

        }

        console.log('Compress application:', 'app.nw');

        var [err, nwFile] = yield NWB.util.ZipDirectory(path, [], join(buildDir, 'app.nw'), cb.expect(2));

        if(err) {
            return callback(err);
        }

        const executable = NWB.GetExecutable(buildDir, target);

        console.log('Combine executable:', executable);

        var err = yield NWB.util.CombineExecutable(executable, nwFile, cb.single);

        if(err) {
            return callback(err);
        }

        const newName = manifest.name + '.exe';

        console.log('Rename application:', newName);

        var err = yield rename(join(buildDir, 'nw.exe'), join(buildDir, newName), cb.single);

        if(err) {
            return callback(err);
        }

        console.log('Done building.');

        callback(null, buildDir);

    });

};

module.exports = BuildWin32Binary;
