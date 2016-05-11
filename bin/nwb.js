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

commander.command('nwbuild [path]')
.option('-v,--version <version>', 'The nw version, eg. 0.8.4')
.option('-p,--platforms <platforms>', 'Platforms to build, comma-sperated, can be: win32,win64,osx32,osx64,linux32,linux64')
.option('-r,--run', 'Runs NW.js for the current platform')
.option('--with-ffmpeg')
//.option('-o,--buildDir', 'The build folder')
//.option('-f,--forceDownload', 'Force download of NW.js')
//.option('--cacheDir', 'The cache folder')
//.option('--quiet', 'Disables logging')
.action(NWB.commands.nwbuild);

if(process.argv.length <= 2) {
    commander.help();
}

commander.parse(process.argv);
