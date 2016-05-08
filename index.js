
'use strict';

const { dirname, basename, join } = require('path');
const { exists, createReadStream } = require('fs');
const { mkdirsSync } = require('fs-extra');

const { createGunzip } = require('zlib');
const tar = require('tar-fs');
const DecompressZip = require('decompress-zip');

const Flow = require('node-flow');

const { GetTarget } = require('nwjs-download');

const DIR_CACHES = join(dirname(module.filename), 'caches');
mkdirsSync(DIR_CACHES);

const GetExecutable = (dir, platform) => {

    switch(platform) {
    case 'win32':
        return join(dir, 'nwjs.exe');
    case 'linux':
        return join(dir, 'nw');
    case 'darwin':
        return join(dir, 'nwjs.app/Contents/MacOS/nwjs');
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

    if(path.endsWith('.zip')) {

        ExtractZip(path, join(DIR_CACHES, basename(path).slice(0, -4)), callback);

    }
    else if(path.endsWith('.tar.gz')) {

        ExtractTarGz(path, join(DIR_CACHES, basename(path).slice(0, -7)), callback);

    }
    else {

        return callback('ERROR_EXTENSION_NOT_SUPPORTED');

    }

};

module.exports = {
    GetExecutable,
    ExtractBinary
};
