
'use strict';

const { dirname, join } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy, remove } = require('fs-extra');
const { exec } = require('child_process');

const temp = require('temp');

const rcedit = require('rcedit');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildWin32Binary = (path, binaryDir, version, platform, arch, {
    withFFmpeg = false,
    sideBySide = false,
    production = false,
    winIco = null
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

            let err = yield temp.mkdir(null, (err, tempDir) => {

                if(err) {
                    return cb.single(err);
                }

                // Extract FFmpeg to temporary directory.

                NWB.DownloadAndExtractFFmpeg(tempDir, {
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

            });

            if(err) {
                return callback(err);
            }

        }

        console.log('Make working directory.');

        var [err, workDir] = yield temp.mkdir(null, cb.expect(2));

        if(err) {
            return callback(err);
        }

        var err = yield copy(path, workDir, cb.single);

        if(err) {
            return callback(err);
        }

        if(production) {

            let nodeModules = join(workDir, 'node_modules');

            console.log('Remove node_modules:', nodeModules);

            let err = yield remove(nodeModules, cb.single);

            if(err) {
                return callback(err);
            }

            console.log('Execute npm install at:', workDir);

            // Fuck dual let declarations.
            let [er, stdout, stderr] = yield exec('npm install', {
                cwd: workDir
            }, cb.expect(3));

            if(er) {
                return callback(er);
            }

            console.log(stdout);
            console.log(stderr);

        }

        if(sideBySide) {

            console.log('Copy application:', workDir);

            let err = yield copy(workDir, buildDir, cb.single);

            if(err) {
                return callback(err);
            }

        }
        else {

            console.log('Compress application:', 'app.nw');

            let [err, nwFile] = yield NWB.util.ZipDirectory(workDir, [], temp.path(), cb.expect(2));

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

        console.log('Edit Windows executable.');

        const rcOptions = {
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

        if(manifest.name) {
            rcOptions['version-string'].ProductName = manifest.name;
        }

        if(manifest.version) {
            rcOptions['version-string'].FileVersion = manifest.version;
            rcOptions['version-string'].ProductVersion = manifest.version;
        }

        if(manifest.description) {
            rcOptions['version-string'].FileDescription = manifest.description;
        }

        if(manifest.author) {
            rcOptions['version-string'].LegalCopyright = `Copyright @ ${ manifest.author }`;
        }

        var err = yield rcedit(join(buildDir, 'nw.exe'), rcOptions, cb.single);

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
