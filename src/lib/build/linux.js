
'use strict';

const { dirname, join, resolve } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy, remove } = require('fs-extra');
const { exec } = require('child_process');

const temp = require('temp');

const glob = require('glob');

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

            let err, manifest;

            console.log(`${ majorIdx++ }: Read package.json`);

            [err, manifest] = yield readJson(join(path, 'package.json'), cb.expect(2));

            if(err) {
                return callback(err);
            }

            this.manifest = manifest;
            this.target = NWD.GetTarget(platform, arch);
            this.buildName = manifest.name + '-' + this.target;
            this.buildDir = outputDir ? join(outputDir, this.buildName) : join(dirname(path), this.buildName);

        }

        {

            let err;

            console.log(`${ majorIdx++ }: Prepare build directory at ${ this.buildDir }`);

            [err, ] = yield emptyDir(this.buildDir, cb.expect(2));

            if(err) {
                return callback(err);
            }

        }

        {

            let err;

            console.log(`${ majorIdx++ }: Copy binary from ${ binaryDir }`);

            err = yield copy(binaryDir, this.buildDir, {}, cb.single);

            if(err) {
                return callback(err);
            }

        }

        if(withFFmpeg) {

            let err, tempDir;

            console.log(`${ majorIdx++ }: Install ffmpeg for nw.js ${ version }`);

            // Make a temporary directory.

            [err, tempDir] = yield temp.mkdir(null, cb.expect(2));

            if(err) {
                return callback(err);
            }

            // Extract FFmpeg to temporary directory.

            [err, , ] = yield NWB.DownloadAndExtractFFmpeg(tempDir, {
                version, platform, arch
            }, cb.expect(3));

            if(err) {
                return callback(err);
            }

            // Overwrite ffmpeg.dll.

            err = yield copy(join(tempDir, 'libffmpeg.so'), join(this.buildDir, 'libffmpeg.so'), {
                clobber: true
            }, cb.single);

            if(err) {
                return callback(err);
            }

        }

        {

            let err, workingDir;

            console.log(`${ majorIdx++ }: Make working directory`);

            [err, workingDir] = yield temp.mkdir(null, cb.expect(2));

            if(err) {
                return callback(err);
            }

            err = yield copy(path, workingDir, cb.single);

            if(err) {
                return callback(err);
            }

            this.workingDir = workingDir;

        }

        if(production) {

            let err, stdout, stderr;

            const nodeModules = join(this.workingDir, 'node_modules');

            console.log(`${ majorIdx++ }: Remove node_modules at ${ nodeModules }`);

            err = yield remove(nodeModules, cb.single);

            if(err) {
                return callback(err);
            }

            console.log(`${ majorIdx++ }: Execute npm install at ${ this.workingDir }`);

            [err, stdout, stderr] = yield exec('npm install', {
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

                let err, files;

                const srcDir = resolve(src);
                const destDir = resolve(join(this.workingDir, dest));

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

            let err;

            console.log(`${ majorIdx++ }: Copy application from ${ this.workingDir }`);

            err = yield copy(this.workingDir, this.buildDir, cb.single);

            if(err) {
                return callback(err);
            }

        }
        else {

            let err, nwFile;

            console.log(`${ majorIdx++ }: Compress application`);

            [err, nwFile] = yield NWB.util.ZipDirectory(this.workingDir, [], temp.path(), cb.expect(2));

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

            let err;

            const newName = this.manifest.name;

            console.log(`${ majorIdx++ }: Rename application to ${ newName }`);

            err = yield rename(join(this.buildDir, 'nw'), join(this.buildDir, newName), cb.single);

            if(err) {
                return callback(err);
            }

        }

        console.log(`${ majorIdx++ }: Done`);

        callback(null, this.buildDir);

    }.bind(context));

};

module.exports = BuildLinuxBinary;
