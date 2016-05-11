
'use strict';

const { dirname, join } = require('path');
const { writeFile, readFile, rename } = require('fs');
const { readJson, emptyDir, copy } = require('fs-extra');

const glob = require('glob');

const plist = require('plist');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildDarwinBinary = (path, binaryDir, version, platform, arch, {
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

        var [err, ] = yield emptyDir(buildDir, cb.expect(2));

        if(err) {
            return callback(err);
        }

        console.log('Copy binary from:', binaryDir);

        var err = yield copy(binaryDir, buildDir, {
            filter: (() => {

                const REGEX_FILTER_I18N = /\/nwjs\.app\/Contents\/Resources\/[a-zA-Z0-9_]+\.lproj/;

                return (path) => {
                    return !REGEX_FILTER_I18N.test(path);
                }

            })()
        }, cb.single);

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

                glob(join(buildDir, 'nwjs.app/**/libffmpeg.dylib'), {}, (err, files) => {

                    if(err) {
                        return cb.single(err);
                    }

                    if(files && files[0]) {

                        copy(join(buildDir, 'libffmpeg.dylib'), files[0], {
                            clobber: true
                        }, cb.single);

                    }

                });

            });

            if(err) {
                return callback(err);
            }

        }

        console.log('Copy application from:', path);

        var err = yield copy(path, join(buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw'), {
            filter: (() => {

                const REGEX_FILTER_BUILDDIR = new RegExp(name);

                return (path) => {
                    return !REGEX_FILTER_BUILDDIR.test(path);
                }

            })()
        }, cb.single);

        if(err) {
            return callback(err);
        }

        const infoFile = join(buildDir, 'nwjs.app', 'Contents', 'Info.plist');

        console.log('Modify plist:', infoFile);

        var [err, pl] = yield readFile(infoFile, {
            encoding: 'utf-8'
        }, (err, data) => {

            if(err) {
                return cb.expect(2)(err);
            }

            cb.expect(2)(null, plist.parse(data.toString()));

        });

        if(err) {
            return callback(err);
        }

        pl['CFBundleDisplayName'] = manifest.name;
        pl['CFBundleName'] = manifest.name;
        pl['CFBundleVersion'] = manifest.version;
        pl['CFBundleShortVersionString'] = manifest.version;
        pl['CFBundleIdentifier'] = 'io.nwjs-builder.' + manifest.name.toLowerCase();

        var err = yield writeFile(infoFile, plist.build(pl), cb.single);

        if(err) {
            return callback(err);
        }

        const newName = manifest.name + '.app';

        console.log('Rename application:', newName);

        var err = yield rename(join(buildDir, 'nwjs.app'), join(buildDir, newName), cb.single);

        if(err) {
            return callback(err);
        }

        console.log('Done building.');

        callback(null, buildDir);

    });

};

module.exports = BuildDarwinBinary;
