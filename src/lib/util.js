
'use strict';

const { join } = require('path');
const { readdir, lstat, createWriteStream, createReadStream } = require('fs');

// compress/decompress modules.

const { createGunzip } = require('zlib');
const tar = require('tar-fs');
const DecompressZip = require('decompress-zip');
const archiver = require('archiver');

const Flow = require('node-async-flow');

const ZipDirectory = (path, excludes, destination, callback) => {

    const debug = require('debug')('NWB:ZipDirectory');

    Flow(function*(cb) {

        const stream = createWriteStream(destination);
        const archive = archiver.create('zip');

        archive.on('error', (err) => callback(err));
        archive.on('end', () => callback(null, destination));

        archive.on('entry', (entry) => debug('entry:', entry));

        const bulks = [];

        var [err, files] = yield readdir(path, cb.expect(2));

        if(err) {
            return callback(err);
        }

        for(let file of files) {

            let src = join(path, file);
            let [err, stats] = yield lstat(src, cb.expect(2));

            if(stats.isFile()) {

                archive.file(src, {
                    name: file,
                    mode: stats.mode
                });

            }
            else if(stats.isDirectory()) {

                archive.directory(src, file, {
                    mode: stats.mode
                });

            }

        }

        archive.pipe(stream);

        archive.finalize();

    });

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

const CombineExecutable = (executable, nwFile, callback) => {

    const nwStream = createReadStream(nwFile);
    const stream = createWriteStream(executable, {
        flags: 'a'
    });

    nwStream.on('error', (err) => callback(err));
    stream.on('error', (err) => callback(err));

    stream.on('finish', () => callback(null));

    nwStream.pipe(stream);

};

Object.assign(module.exports, {
    ZipDirectory,
    ExtractZip,
    ExtractTarGz,
    CombineExecutable
});
