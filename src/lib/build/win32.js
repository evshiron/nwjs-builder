
'use strict';

const { dirname, join, resolve } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy, remove } = require('fs-extra');
const { exec } = require('child_process');
const assert = require('assert');

const format = require('string-template');

const temp = require('temp').track();

const glob = require('glob');

const rcedit = require('rcedit');
const resourceHacker = require('node-resourcehacker');

const Flow = require('node-async-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildWin32Binary = (path, binaryDir, version, platform, arch, {
    outputDir = null,
    outputName = null,
    executableName = null,
    outputFormat = null,
    includes = null,
    withFFmpeg = false,
    sideBySide = false,
    production = false,
    winIco = null
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

            const REGEX_FILTER_DONE = /[\\\/]\.done/;

            err = yield copy(binaryDir, this.buildDir, {
                filter: (path) => !REGEX_FILTER_DONE.test(path)
            }, cb.single);

            if(err) {
                return callback(err);
            }

        }

        {

            let err;

            console.log(`${ majorIdx++ }: Edit Windows executable`);

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
                }
            };

            assert(this.manifest.name, "Missing name in package.json");
            assert(this.manifest.version, "Missing version in package.json");

            rcOptions['version-string'].ProductName = this.manifest.name;
            rcOptions['product-version'] = this.manifest.version;

            if(this.manifest.description) {
                rcOptions['version-string'].FileDescription = this.manifest.description;
            }

            if(this.manifest.nwjsBuilder) {

                const properties = this.manifest.nwjsBuilder;

                if(properties.productName) {
                    rcOptions['version-string'].ProductName = properties.productName;
                }

                if(properties.productVersion) {
                    rcOptions['product-version'] = properties.productVersion;
                }

                if(properties.fileDescription) {
                    rcOptions['version-string'].FileDescription = properties.fileDescription;
                }

                if(properties.copyright) {
                    rcOptions['version-string'].LegalCopyright = properties.copyright;
                }

                if(properties.internalName) {
                    rcOptions['version-string'].InternalName = properties.internalName;
                }

                if(properties.fileVersion) {
                    rcOptions['file-version'] = properties.fileVersion;
                }

                if(properties.comments) {
                    rcOptions['version-string'].Comments = properties.comments;
                }

                if(properties.companyName) {
                    rcOptions['version-string'].CompanyName = properties.companyName;
                }

                if(properties.legalTrademarks) {
                    rcOptions['version-string'].LegalTrademarks = properties.legalTrademarks;
                }

                if(properties.originalFilename) {
                    rcOptions['version-string'].OriginalFilename = properties.originalFilename;
                }

                if(properties.privateBuild) {
                    rcOptions['version-string'].PrivateBuild = properties.privateBuild;
                }

                if(properties.specialBuild) {
                    rcOptions['version-string'].SpecialBuild = properties.specialBuild;
                }

            }

            err = yield rcedit(join(this.buildDir, 'nw.exe'), rcOptions, cb.single);

            if(err) {
                console.warn(err);
            }

            if(winIco) {

                err = yield resourceHacker({
                    operation: 'addoverwrite',
                    input: join(this.buildDir, 'nw.exe'),
                    output: join(this.buildDir, 'nw.exe'),
                    resource: winIco,
                    resourceType: 'ICONGROUP',
                    resourceName: 'IDR_MAINFRAME'
                }, cb.single);

                if(err) {
                    console.warn(err);
                }

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

            err = yield NWB.util.CombineExecutable(executable, nwFile, cb.single);

            if(err) {
                return callback(err);
            }

        }

        {

            let err;

            const newName = (executableName ? executableName : this.manifest.name) + '.exe';

            console.log(`${ majorIdx++ }: Rename application to ${ newName }`);

            err = yield rename(join(this.buildDir, 'nw.exe'), join(this.buildDir, newName), cb.single);

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

module.exports = BuildWin32Binary;
