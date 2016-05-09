
'use strict';

const { homedir } = require('os');
const { dirname, basename, join } = require('path');
const { exists, createReadStream, mkdir } = require('fs');
const { mkdirsSync } = require('fs-extra');

const { createGunzip } = require('zlib');
const tar = require('tar-fs');
const DecompressZip = require('decompress-zip');

const Flow = require('node-flow');

const { GetTarget } = require('nwjs-download');

const DIR_CACHES = join(homedir(), '.nwjs-builder', 'caches');
mkdirsSync(DIR_CACHES);

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

const ExtractZip = (path, destination, callback) => {

    const unzip = new DecompressZip(path);
    unzip.on('error', (err) => callback(err))
    .on('extract', () => callback(null, destination))
    .extract({
        path: destination,
        // Ignore the root directory.
        strip: 1
    });

};

const ExtractTarGz = (path, destination, callback) => {

    const gunzip = createGunzip();
    const untar = tar.extract(destination, {
        map: (header) => Object.assign(header, {
            // Ignore the root directory.
            name: header.name.split('/').slice(1).join('/')
        })
    });

    const stream = createReadStream(path);

    stream
    .pipe(gunzip)
    .on('error', (err) => callback(err))
    .pipe(untar)
    .on('finish', () => callback(null, destination));

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

module.exports = {
    GetExecutable,
    ExtractBinary
};
