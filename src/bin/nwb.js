#!/usr/bin/env node

'use strict';

const commander = require('commander');

const NWD = require('nwjs-download');

const NWB = require('../');

const IncludeHandler = (value, memo) => {

    const parts = value.split(':');

    if(parts.length == 1) {
        throw new Error('ERROR_INCLUDE_ARGUMENT_COUNT');
    }
    else if(parts.length == 2) {
        memo.push([...parts, './']);
    }
    else if(parts.length == 3) {
        memo.push(parts);
    }

    return memo;

};

commander.version(require('../package.json').version);

commander.command('*')
.action(() => commander.help());

commander.command('list')
.action(NWD.commands.list);

commander.command('latest')
.action(NWD.commands.latest);

commander.command('stable')
.action(NWD.commands.stable);

commander.command('caches')
.action(NWD.commands.caches);

commander.command('download')
.option('-v,--version <version>')
.option('-p,--platform <platform>')
.option('-a,--arch <arch>')
.option('-f,--flavor <flavor>')
.option('-m,--mirror <mirror_url>')
.action(NWD.commands.download);

commander.command('nwbuild [PATH]')
.option('-v,--version <VERSION>', 'The nw.js version, eg. 0.8.4, defaults to the stable version.')
.option('-p,--platforms <PLATFORMS>', 'Platforms to build, comma-sperated, eg. win32,win64,osx32,osx64,linux32,linux64, defaults to the current platform.')
.option('-r,--run', 'Runs nw.js at PATH for the current platform.')
.option('-o,--output-dir <DIR_OUTPUT>', 'The output directory, defaults to PATH\'s parent.')
.option('-i, --include <DIR_SRC>:<GLOB>[:DIR_DEST]', 'Include extra files matching GLOB from DIR_SRC to DIR_BUILD/DIR_DEST.', IncludeHandler, [])
.option('-m,--mirror <MIRROR_URL>', 'Where to download the packages from (default is http://dl.nwjs.io)')
.option('--with-ffmpeg', 'Fetch nwjs-ffmpeg-prebuilt to support .mp3 etc.')
.option('--side-by-side', 'Build application with side by side packaging.')
.option('--production', 'Reinstall dependencies for production purpose.')
.option('--win-ico <WIN_ICO>', 'Specify .ico for Windows build.')
.option('--mac-icns <MAC_ICNS>', 'Specify .icns for Mac OS X build.')
//.option('-f,--forceDownload', 'Force download of NW.js')
//.option('--cacheDir', 'The cache folder')
//.option('--quiet', 'Disables logging')
.action(NWB.commands.nwbuild);

if(process.argv.length <= 2) {
    commander.help();
}

commander.parse(process.argv);
