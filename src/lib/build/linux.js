
'use strict';

const { dirname, join } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy, remove } = require('fs-extra');
const { exec } = require('child_process');

const temp = require('temp');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildLinuxBinary = (path, binaryDir, version, platform, arch, {
    outputDir = null,
    includes = null,
    withFFmpeg = false,
    sideBySide = false,
    production = false
}, callback) => {

    const context = {};

    Flow(function*(cb) {

        let majorIdx = 0;

        {

            console.log(`${ majorIdx++ }: Read package.json`);

            var [err, manifest] = yield readJson(join(path, 'package.json'), cb.expect(2));

            if(err) {
                return callback(err);
            }

            this.manifest = manifest;
            this.target = NWD.GetTarget(platform, arch);
            this.buildName = manifest.name + '-' + this.target;
            this.buildDir = outputDir ? join(outputDir, this.buildName) : join(dirname(path), this.buildName);

        }

        {

            console.log(`${ majorIdx++ }: Prepare build directory at ${ this.buildDir }`);

            var [err, ] = yield emptyDir(this.buildDir, cb.expect(2));

            if(err) {
                return callback(err);
            }

        }

        {

            console.log(`${ majorIdx++ }: Copy binary from ${ binaryDir }`);

            var err = yield copy(binaryDir, this.buildDir, {}, cb.single);

            if(err) {
                return callback(err);
            }

        }

        if(withFFmpeg) {

            console.log(`${ majorIdx++ }: Install ffmpeg for nw.js ${ version }`);

            // Make a temporary directory.

            var err = yield temp.mkdir(null, (err, tempDir) => {

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

                    // Overwrite libffmpeg.so.

                    copy(join(tempDir, 'libffmpeg.so'), join(this.buildDir, 'lib/libffmpeg.so'), {
                        clobber: true
                    }, cb.single);

                });

            });

            if(err) {
                return callback(err);
            }

        }

        {

            console.log(`${ majorIdx++ }: Make working directory`);

            var [err, workingDir] = yield temp.mkdir(null, cb.expect(2));

            if(err) {
                return callback(err);
            }

            var err = yield copy(path, workingDir, cb.single);

            if(err) {
                return callback(err);
            }

            this.workingDir = workingDir;

        }

        if(production) {

            const nodeModules = join(this.workingDir, 'node_modules');

            console.log(`${ majorIdx++ }: Remove node_modules at ${ nodeModules }`);

            var err = yield remove(nodeModules, cb.single);

            if(err) {
                return callback(err);
            }

            console.log(`${ majorIdx++ }: Execute npm install at ${ this.workingDir }`);

            var [err, stdout, stderr] = yield exec('npm install', {
                cwd: this.workingDir
            }, cb.expect(3));

            if(err) {
                return callback(err);
            }

            //console.log(stdout);
            console.log(stderr);

        }

        if(includes) {

            console.log(`${ majorIdx++ }: Copy included files to ${ this.workingDir }`);

            for(let [src, gl, dest] of includes) {

                let files;
                let srcDir = resolve(src);
                let destDir = resolve(join(this.workingDir, dest));

                [err, files] = yield glob(gl, {
                    cwd: srcDir
                }, cb.expect(2));

                if(err) {
                    return callback(err);
                }

                for(let file of files) {

                    let src = resolve(join(srcDir, file));
                    let dest = resolve(join(destDir, file));

                    err = yield copy(src, dest, cb.single);

                    if(err) {
                        return callback(err);
                    }

                }

            }

        }

        if(sideBySide) {

            console.log(`${ majorIdx++ }: Copy application from ${ this.workingDir }`);

            var err = yield copy(this.workingDir, this.buildDir, cb.single);

            if(err) {
                return callback(err);
            }

        }
        else {

            console.log(`${ majorIdx++ }: Compress application`);

            var [err, nwFile] = yield NWB.util.ZipDirectory(this.workingDir, [], temp.path(), cb.expect(2));

            if(err) {
                return callback(err);
            }

            const executable = NWB.GetExecutable(this.buildDir, this.target);

            console.log(`${ majorIdx++ }: Combine executable at ${ executable }`);

            var err = yield NWB.util.CombineExecutable(executable, nwFile, cb.single);

            if(err) {
                return callback(err);
            }

        }

        {

            const newName = manifest.name;

            console.log(`${ majorIdx++ }: Rename application to ${ newName }`);

            var err = yield rename(join(this.buildDir, 'nw'), join(this.buildDir, newName), cb.single);

            if(err) {
                return callback(err);
            }

        }

        console.log(`${ majorIdx++ }: Done`);

        callback(null, this.buildDir);

    }.bind(context));

};

module.exports = BuildLinuxBinary;
