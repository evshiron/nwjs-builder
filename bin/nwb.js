#!/usr/bin/env node --harmony-destructuring --harmony-rest-parameters

'use strict';

const { dirname, join, resolve } = require('path');
const { readFile, writeFile, createWriteStream, createReadStream, rename } = require('fs');
const { readJson, emptyDir, copy } = require('fs-extra');
const { spawn } = require('child_process');

const commander = require('commander');

const plist = require('plist');

const Flow = require('node-flow');

const {
    GetTarget, GetPlatform, GetVersionList, GetLatestVersion, GetStableVersion, DownloadBinary
} = require('nwjs-download');

const {
    GetExecutable, ExtractBinary
} = require('../');

const { ZipDir } = require('../lib/util');

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

            let [err, versions] = yield GetVersionList((err, versions) => cb(err, versions));

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

            let [err, version] = yield GetLatestVersion((err, version) => cb(err, version));

            if(err) {
                return callback(err);
            }

            return callback(err, version.version, null);

        }

    });

};

const DownloadAndExtractBinary = ({
    version = null,
    platform = null,
    arch = null,
    flavor = null
}, callback) => {

        // Download nw.js.

        DownloadBinary({
            version, platform, arch, flavor,
            showProgressbar: true
        }, (err, fromCache, path) => {

            console.log();

            if(err) {
                return callback(err);
            }

            // Extract nw.js.

            ExtractBinary(path, (err, fromDone, binaryDir) => {

                if(err) {
                    return callback(err);
                }

                callback(err, fromCache, fromDone, binaryDir);

            });

        });

};

const CombineExecutable = (executable, nwFile, callback) => {

    const nwStream = createReadStream(nwFile);
    const stream = createWriteStream(executable, {
        flags: 'a'
    });

    nwStream.on('error', (err) => callback(err));
    stream.on('error', (err) => callback(err));

    nwStream.on('end', () => callback(null));

    nwStream.pipe(stream);

};

const BuildWin32Binary = (path, binaryDir, target, options, callback) => {

    Flow(function*(cb) {

        var [err, manifest] = yield readJson(join(path, 'package.json'), (err, json) => cb(err, json));

        if(err) {
            return callback(err);
        }

        const name = manifest.name + '-' + target;
        const buildDir = join(dirname(path), name);

        console.log('Create build directory:', buildDir);

        var [err,] = yield emptyDir(buildDir, (err, path) => cb(err, path));

        if(err) {
            return callback(err);
        }

        console.log('Copy binary:', binaryDir);

        var err = yield copy(binaryDir, buildDir, {}, cb);

        if(err) {
            return callback(err);
        }

        console.log('Compress application:', 'app.nw');

        var [err, nwFile] = yield ZipDir(path, [], join(buildDir, 'app.nw'), (err, destination) => cb(err, destination));

        if(err) {
            return callback(err);
        }

        const executable = GetExecutable(buildDir, target);

        console.log('Combine executable:', executable);

        var err = yield CombineExecutable(executable, nwFile, cb);

        if(err) {
            return callback(err);
        }

        const newName = manifest.name + '.exe';

        console.log('Rename application:', newName);

        var err = yield rename(join(buildDir, 'nw.exe'), join(buildDir, newName), (err) => cb(err));

        if(err) {
            return callback(err);
        }

        console.log('Done building.');

        callback(null, buildDir);

    });

};

const BuildLinuxBinary = (path, binaryDir, target, options, callback) => {

    Flow(function*(cb) {

        var [err, manifest] = yield readJson(join(path, 'package.json'), (err, json) => cb(err, json));

        if(err) {
            return callback(err);
        }

        const name = manifest.name + '-' + target;
        const buildDir = join(dirname(path), name);

        console.log('Create build directory:', buildDir);

        var [err,] = yield emptyDir(buildDir, (err, path) => cb(err, path));

        if(err) {
            return callback(err);
        }

        console.log('Copy binary:', binaryDir);

        var err = yield copy(binaryDir, buildDir, {}, cb);

        if(err) {
            return callback(err);
        }

        console.log('Compress application:', 'app.nw');

        var [err, nwFile] = yield ZipDir(path, [], join(buildDir, 'app.nw'), (err, destination) => cb(err, destination));

        if(err) {
            return callback(err);
        }

        const executable = GetExecutable(buildDir, target);

        console.log('Combine executable:', executable);

        var err = yield CombineExecutable(executable, nwFile, cb);

        if(err) {
            return callback(err);
        }

        const newName = manifest.name;

        console.log('Rename application:', newName);

        var err = yield rename(join(buildDir, 'nw'), join(buildDir, newName), (err) => cb(err));

        if(err) {
            return callback(err);
        }

        console.log('Done building.');

        callback(null, buildDir);

    });

};

const BuildDarwinBinary = (path, binaryDir, target, options, callback) => {

    Flow(function*(cb) {

        var [err, manifest] = yield readJson(join(path, 'package.json'), (err, json) => cb(err, json));

        if(err) {
            return callback(err);
        }

        const name = manifest.name + '-' + target;
        const buildDir = join(dirname(path), name);

        console.log('Create build directory:', buildDir);

        var [err,] = yield emptyDir(buildDir, (err, path) => cb(err, path));

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
        }, cb);

        if(err) {
            return callback(err);
        }

        console.log('Copy application from:', path);

        var err = yield copy(path, join(buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw'), {
            filter: (() => {

                const REGEX_FILTER_BUILDDIR = new RegExp(name);

                return (path) => {
                    return !REGEX_FILTER_BUILDDIR.test(path);
                }

            })()
        }, cb);

        if(err) {
            return callback(err);
        }

        const infoFile = join(buildDir, 'nwjs.app', 'Contents', 'Info.plist');

        console.log('Modify plist:', infoFile);

        var [err, pl] = yield readFile(infoFile, {
            encoding: 'utf-8'
        }, (err, data) => {

            if(err) {
                return cb(err);
            }

            cb(null, plist.parse(data.toString()));

        });

        if(err) {
            return callback(err);
        }

        pl['CFBundleDisplayName'] = manifest.name;
        pl['CFBundleName'] = manifest.name;
        pl['CFBundleVersion'] = manifest.version;
        pl['CFBundleShortVersionString'] = manifest.version;
        pl['CFBundleIdentifier'] = 'io.nwjs-builder.' + manifest.name.toLowerCase();

        var err = yield writeFile(infoFile, plist.build(pl), cb);

        if(err) {
            return callback(err);
        }

        const newName = manifest.name + '.app';

        console.log('Rename application:', newName);

        var err = yield rename(join(buildDir, 'nwjs.app'), join(buildDir, newName), (err) => cb(err));

        if(err) {
            return callback(err);
        }

        console.log('Done building.');

        callback(null, buildDir);

    });

};

const LaunchExecutable = (executable, path, callback) => {

    const cp = spawn(executable, [path]);

    if(!cp) return callback('ERROR_LAUNCH_FAILED');

    cp.stdout.on('data', (data) => console.log(data.toString()));
    cp.stderr.on('data', (data) => console.error(data.toString()));

    cp.on('close', (code) => callback(null, code));

};

const NwBuilderBuild = (path, command) => {

    Flow(function*(cb) {

        const options = {
            version: null,
            flavor: null,
            targets: [],
            path: null
        };

        var [err, version, flavor] = yield ParseNwBuilderVersion(command.version, (err, version, flavor) => cb(err, version, flavor));

        if(err) {
            console.error(err);
            return;
        }

        options.version = version;
        options.flavor = flavor;

        if(command.platforms) {

            let parts = command.platforms.split(',');

            for(let platform of parts) {

                switch(platform) {
                case 'win32':
                    options.targets.push(['win', 'x86']);
                    break;
                case 'win64':
                    options.targets.push(['win', 'x64']);
                    break;
                case 'linux32':
                    options.targets.push(['linux', 'x86']);
                    break;
                case 'linux64':
                    options.targets.push(['linux', 'x64']);
                    break;
                case 'osx32':
                    options.targets.push(['osx', 'x86']);
                    break;
                case 'osx64':
                    options.targets.push(['osx', 'x64']);
                    break;
                default:
                    console.warn('WARN_PLATFORM_UNRECOGNIZED');
                    console.warn('platform:', platform);
                    break;
                }

            }

        }
        else {

            options.targets.push([process.platform, process.arch]);

        }

        options.path = path ? path : '.';

        console.log(options);

        for(let target of options.targets) {

            let [platform, arch] = target;

            let params = {
                version: options.version,
                platform: platform,
                arch: arch,
                flavor: options.flavor,
                showProgressbar: true
            };

            let [err, fromCache, fromDone, binaryDir] = yield DownloadAndExtractBinary({
                version: options.version,
                platform: platform,
                arch: arch,
                flavor: options.flavor
            }, (err, fromCache, fromDone, binaryDir) => cb(err, fromCache, fromDone, binaryDir));

            if(err) {
                console.error(err);
                return;
            }

            switch(GetPlatform(platform)) {
            case 'win32':

                {

                    let [err, path] = yield BuildWin32Binary(options.path, binaryDir, GetTarget(platform, arch), {}, (err, path) => cb(err, path));

                    if(err) {
                        console.error(err);
                        return;
                    }

                    console.log(`${ GetTarget(platform, arch) } build: ${ resolve(path) }.`);

                }

                break;
            case 'linux':

                {

                    let [err, path] = yield BuildLinuxBinary(options.path, binaryDir, GetTarget(platform, arch), {}, (err, path) => cb(err, path));

                    if(err) {
                        console.error(err);
                        return;
                    }

                    console.log(`${ GetTarget(platform, arch) } build: ${ resolve(path) }.`);

                }

                return;
            case 'darwin':

                {

                    let [err, path] = yield BuildDarwinBinary(options.path, binaryDir, GetTarget(platform, arch), {}, (err, path) => cb(err, path));

                    if(err) {
                        console.error(err);
                        return;
                    }

                    console.log(`${ GetTarget(platform, arch) } build: ${ resolve(path) }.`);

                }

                break;
            }

        }

    });

};

const NwBuilderRun = (path, command) => {

    Flow(function*(cb) {

        const options = {
            version: null,
            platform: null,
            arch: null,
            flavor: null,
            path: null
        };

        // Parse platform and arch.

        options.platform = process.platform;
        options.arch = process.arch;

        // Parse version.

        var [err, version, flavor] = yield ParseNwBuilderVersion(command.version, (err, version, flavor) => cb(err, version, flavor));

        if(err) {
            console.error(err);
            return;
        }

        options.version = version;
        options.flavor = flavor;

        // Parse path.

        options.path = path ? path : '.';

        console.log(options);

        var [err, fromCache, fromDone, binaryDir] = yield DownloadAndExtractBinary({
            version: options.version,
            platform: options.platform,
            arch: options.arch,
            flavor: options.flavor
        }, (err, fromCache, fromDone, binaryDir) => cb(err, fromCache, fromDone, binaryDir));

        if(err) {
            console.error(err);
            return;
        }

        const executable = GetExecutable(binaryDir, options.platform);

        var [err, code] = yield LaunchExecutable(executable, options.path, (err, code) => cb(err, code));

        if(err) {
            console.error(err);
            return;
        }

        console.log(`nw.js exits with code ${ code }.`);

    });

};

commander.version(require('../package.json').version);

commander.command('*')
.action(() => commander.help());

commander.command('nwbuild [path]')
.option('-v,--version <version>', 'The nw version, eg. 0.8.4')
.option('-p,--platforms <platforms>', 'Platforms to build, comma-sperated, can be: win32,win64,osx32,osx64,linux32,linux64')
.option('-r,--run', 'Runs NW.js for the current platform')
//.option('-o,--buildDir', 'The build folder')
//.option('-f,--forceDownload', 'Force download of NW.js')
//.option('--cacheDir', 'The cache folder')
//.option('--quiet', 'Disables logging')
.action((path, command) => {

    if(command.run) {

        NwBuilderRun(path, command);

    }
    else {

        NwBuilderBuild(path, command);

    }

});

if(process.argv.length <= 2) {
    commander.help();
}

commander.parse(process.argv);
