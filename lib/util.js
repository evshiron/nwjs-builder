
'use strict';

const { join } = require('path');
const { readdir, lstat, createWriteStream } = require('fs');

const archiver = require('archiver');

const Flow = require('node-flow');

const ZipDir = (path, excludes, destination, callback) => {

    const debug = require('debug')('NWB:ZipDir');

    Flow(function*(cb) {

        const stream = createWriteStream(destination);
        const archive = archiver.create('zip');

        archive.on('error', (err) => callback(err));
        archive.on('end', () => callback(null, destination));

        archive.on('entry', (entry) => debug('entry:', entry));

        const bulks = [];

        var [err, files] = yield readdir(path, (err, files) => cb(err, files));

        if(err) {
            return callback(err);
        }

        for(let file of files) {

            let src = join(path, file);
            let [err, stats] = yield lstat(src, (err, stats) => cb(err, stats));

            if(stats.isFile()) {

                archive.file(src, {
                    name: file
                });

            }
            else if(stats.isDirectory()) {

                archive.directory(src, file, {});

            }

        }

        archive.pipe(stream);

        archive.finalize();

    });

};

module.exports = {
    ZipDir
};
