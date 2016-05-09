
'use strict';

const { homedir } = require('os');
const { dirname, basename, join } = require('path');
const { exists, writeFile, readFile, createReadStream, mkdir, rename } = require('fs');
const { mkdirsSync, readJson, emptyDir, copy } = require('fs-extra');

const { spawn } = require('child_process');

const plist = require('plist');

const Flow = require('node-flow');

const NWD = require('nwjs-download');

const { ZipDirectory, ExtractZip, ExtractTarGz, CombineExecutable } = require('./lib/util');

const DIR_CACHES = join(homedir(), '.nwjs-builder', 'caches');
mkdirsSync(DIR_CACHES);

// Extracted flag.
const FILENAME_DONE = '.done';

const GetExecutable = (binaryDir, platform) => {

    switch(platform) {
    case 'win32':
    case 'win-ia32':
    case 'win-x64':
        return join(binaryDir, 'nw.exe');
    case 'linux':
    case 'linux-ia32':
    case 'linux-x64':
        return join(binaryDir, 'nw');
    case 'darwin':
    case 'osx-ia32':
    case 'osx-x64':
        return join(binaryDir, 'nwjs.app/Contents/MacOS/nwjs');
    default:
        // FIXME: Application exits sliently.
        //throw new Error('ERROR_WHAT_THE_FUCK');
        return null;
    }

};

const ExtractBinary = (path, callback) => {

    Flow(function*(cb) {

        var destination = null;
        var extract = null;

        if(path.endsWith('.zip')) {
            destination = join(DIR_CACHES, basename(path).slice(0, -4));
            extract = ExtractZip;
        }
        else if(path.endsWith('.tar.gz')) {
            destination = join(DIR_CACHES, basename(path).slice(0, -7));
            extract = ExtractTarGz;
        }
        else {
            return callback('ERROR_EXTENSION_NOT_SUPPORTED');
        }

        const done = join(destination, FILENAME_DONE);

        const doneExists = yield exists(done, cb);

        if(doneExists) {
            return callback(null, true, destination);
        }
        else {
            return extract(path, destination, (err, destination) => {

                if(err) {
                    return callback(err);
                }

                mkdir(done, (err) => {

                    if(err) {
                        return callback(err);
                    }

                    return callback(null, false, destination);

                });

            });
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

    NWD.DownloadBinary({
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

        console.log('Copy binary from:', binaryDir);

        var err = yield copy(binaryDir, buildDir, {}, cb);

        if(err) {
            return callback(err);
        }

        console.log('Compress application:', 'app.nw');

        var [err, nwFile] = yield ZipDirectory(path, [], join(buildDir, 'app.nw'), (err, destination) => cb(err, destination));

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

        console.log('Copy binary from:', binaryDir);

        var err = yield copy(binaryDir, buildDir, {}, cb);

        if(err) {
            return callback(err);
        }

        console.log('Compress application:', 'app.nw');

        var [err, nwFile] = yield ZipDirectory(path, [], join(buildDir, 'app.nw'), (err, destination) => cb(err, destination));

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

Object.assign(module.exports, {
    util: require('./lib/util'),
    commands: require('./lib/commands'),
    GetExecutable,
    ExtractBinary,
    DownloadAndExtractBinary,
    BuildWin32Binary,
    BuildLinuxBinary,
    BuildDarwinBinary,
    LaunchExecutable
});
