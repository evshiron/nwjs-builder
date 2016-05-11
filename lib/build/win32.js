
'use strict';

const { dirname, join } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy } = require('fs-extra');

const temp = require('temp');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildWin32Binary = (path, binaryDir, version, platform, arch, {
    withFFmpeg = false,
    sideBySide = false
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

            console.log('Copy ffmpeg for:', version);

            // Make a temporary directory.

            yield temp.mkdir(null, (err, tempDir) => {

                if(err) {
                    return cb.single(err);
                }

                // Extract FFmpeg to temporary directory.

                var err = NWB.DownloadAndExtractFFmpeg(tempDir, {
                    version, platform, arch
                }, (err, fromCache, tempDir) => {

                    if(err) {
                        return cb.single(err);
                    }

                    // Overwrite ffmpeg.dll.

                    copy(join(tempDir, 'ffmpeg.dll'), join(buildDir, 'ffmpeg.dll'), {
                        clobber: true
                    }, cb.single);

                });

                if(err) {
                    return callback(err);
                }

            });

        }

        if(sideBySide) {

            console.log('Copy application:', path);

            let err = yield copy(path, buildDir, cb.single);

            if(err) {
                return callback(err);
            }

        }
        else {

            console.log('Compress application:', 'app.nw');

            let [err, nwFile] = yield NWB.util.ZipDirectory(path, [], join(buildDir, 'app.nw'), cb.expect(2));

            if(err) {
                return callback(err);
            }

            const executable = NWB.GetExecutable(buildDir, target);

            console.log('Combine executable:', executable);

            err = yield NWB.util.CombineExecutable(executable, nwFile, cb.single);

            if(err) {
                return callback(err);
            }

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
