
'use strict';

const { dirname, join, resolve } = require('path');
const { rename } = require('fs');
const { readJson, emptyDir, copy, remove } = require('fs-extra');
const { exec } = require('child_process');

const temp = require('temp');

const glob = require('glob');

const rcedit = require('rcedit');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const NWB = require('../../');

const BuildWin32Binary = (path, binaryDir, version, platform, arch, {
    outputDir = null,
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

        {

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
                },
                'icon': winIco ? winIco : undefined
            };

            if(manifest.name) {
                rcOptions['version-string'].ProductName = manifest.name;
            }

            if(manifest.version) {
                rcOptions['product-version'] = manifest.version;
            }

            if(manifest.description) {
                rcOptions['version-string'].FileDescription = manifest.description;
            }

            if(manifest.nwjsBuilder) {

                const properties = manifest.nwjsBuilder;

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

            var err = yield rcedit(join(this.buildDir, 'nw.exe'), rcOptions, cb.single);

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

                    // Overwrite ffmpeg.dll.

                    copy(join(tempDir, 'ffmpeg.dll'), join(this.buildDir, 'ffmpeg.dll'), {
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

            const newName = manifest.name + '.exe';

            console.log(`${ majorIdx++ }: Rename application to ${ newName }`);

            var err = yield rename(join(this.buildDir, 'nw.exe'), join(this.buildDir, newName), cb.single);

            if(err) {
                return callback(err);
            }

        }

        console.log(`${ majorIdx++ }: Done`);

        callback(null, this.buildDir);

    }.bind(context));

};

module.exports = BuildWin32Binary;
