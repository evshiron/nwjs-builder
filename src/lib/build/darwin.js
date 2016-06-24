
'use strict';

const { dirname, join, resolve } = require('path');
const { exists, writeFile, readFile, rename } = require('fs');
const { readJson, emptyDir, copy, remove } = require('fs-extra');
const { exec } = require('child_process');

const format = require('string-template');

const temp = require('temp');

const glob = require('glob');

const plist = require('plist');

const Flow = require('node-async-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildDarwinBinary = (path, binaryDir, version, platform, arch, {
    outputDir = null,
    outputName = null,
    executableName = null,
    outputFormat = null,
    includes = null,
    withFFmpeg = false,
    sideBySide = false,
    production = false,
    macIcns = null
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
            this.buildName = format(outputName ? outputName : '{name}-{target}', {
                name: manifest.name,
                version: manifest.version,
                platform: platform,
                arch: arch,
                target: this.target
            });
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

            const REGEX_FILTER_I18N = /\/nwjs\.app\/Contents\/Resources\/[a-zA-Z0-9_]+\.lproj/;
            const REGEX_FILTER_DONE = /\/.done/;

            err = yield copy(binaryDir, this.buildDir, {
                // Ignore i18n files.
                filter: (path) => !REGEX_FILTER_I18N.test(path) && !REGEX_FILTER_DONE.test(path)
            }, cb.single);

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

            err = yield NWB.InstallFFmpeg(tempDir, this.buildDir, platform, cb.single);

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

        {

            let err, pl;

            const infoFile = join(this.buildDir, 'nwjs.app', 'Contents', 'Info.plist');

            console.log(`${ majorIdx++ }: Modify Info.plist at ${ infoFile }`);

            [err, pl] = yield readFile(infoFile, {
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

            pl['CFBundleDisplayName'] = this.manifest.name;
            pl['CFBundleName'] = this.manifest.name;
            pl['CFBundleVersion'] = this.manifest.version;
            pl['CFBundleShortVersionString'] = this.manifest.version;
            pl['CFBundleIdentifier'] = 'io.nwjs-builder.' + this.manifest.name.toLowerCase();

            err = yield writeFile(infoFile, plist.build(pl), cb.single);

            if(err) {
                return callback(err);
            }

        }

        if(macIcns) {

            let err, dest;

            console.log(`${ majorIdx++ }: Copy .icns to ${ this.buildDir }`);

            // For nw.js 0.12.x.
            dest = join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'nw.icns');
            if(yield exists(dest, cb.single)) {

                err = yield copy(macIcns, dest, cb.single);

                if(err) {
                    return callback(err);
                }

            }

            // For modern nw.js.
            dest = join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.icns');
            if(yield exists(dest, cb.single)) {

                err = yield copy(macIcns, dest, cb.single);

                if(err) {
                    return callback(err);
                }

            }

        }

        {

            let err;

            console.log(`${ majorIdx++ }: Copy application from ${ this.workingDir }`);

            err = yield copy(this.workingDir, join(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw'), cb.single);

            if(err) {
                return callback(err);
            }

        }

        {

            let err;

            const newName = (executableName ? executableName : this.manifest.name) + '.app';

            console.log(`${ majorIdx++ }: Rename application to ${ newName }`);

            err = yield rename(join(this.buildDir, 'nwjs.app'), join(this.buildDir, newName), cb.single);

            if(err) {
                return callback(err);
            }

        }

        if(outputFormat == 'ZIP') {

            let err;

            const zipFile = `${ this.buildDir }.zip`;

            console.log(`${ majorIdx++ }: Zip to ${ zipFile }`);

            [err, ] = yield NWB.util.ZipDirectory(this.buildDir, [], zipFile, cb.expect(2));

            if(err) {
                return callback(err);
            }

            console.log(`${ majorIdx++ }: Clean up ${ this.buildDir }`);

            err = yield remove(this.buildDir, cb.single);

            if(err) {
                return callback(err);
            }

        }

        console.log(`${ majorIdx++ }: Done`);

        callback(null, this.buildDir);

    }.bind(context));

};

module.exports = BuildDarwinBinary;
