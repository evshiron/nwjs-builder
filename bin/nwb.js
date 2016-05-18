#!/usr/bin/env node --harmony-destructuring --harmony-rest-parameters

'use strict';

const commander = require('commander');

const NWD = require('nwjs-download');

const NWB = require('../');

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
.action(NWD.commands.download);

commander.command('nwbuild [PATH]')
.option('-v,--version <VERSION>', 'The nw.js version, eg. 0.8.4, defaults to the stable version.')
.option('-p,--platforms <PLATFORMS>', 'Platforms to build, comma-sperated, eg. win32,win64,osx32,osx64,linux32,linux64, defaults to the current platform.')
.option('-r,--run', 'Runs nw.js at PATH for the current platform.')
.option('-o,--output-dir <DIR_OUTPUT>', 'The output directory, defaults to PATH\'s parent.')
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
