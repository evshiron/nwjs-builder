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
.option('-v,--version <VERSION>')
.option('-p,--platform <PLATFORM>')
.option('-a,--arch <ARCH>')
.option('-f,--flavor <FLAVOR>')
.option('-m,--mirror <URL_MIRROR>')
.action(NWD.commands.download);

commander.command('nwbuild [PATH_OR_ARGS...]')
.option('-v,--version <VERSION>', 'The nw.js version, eg. 0.8.4, defaults to the stable version.')
.option('-p,--platforms <PLATFORMS>', 'Platforms to build, comma-sperated, eg. win32,win64,osx32,osx64,linux32,linux64, defaults to the current platform.')
.option('-r,--run', 'Runs nw.js at PATH for the current platform.')
.option('-o,--output-dir <DIR_OUTPUT>', 'The output directory, defaults to PATH\'s parent.')
.option('-i,--include <DIR_SRC>:<GLOB>[:DIR_DEST]', 'Include extra files matching GLOB from DIR_SRC to DIR_BUILD/DIR_DEST.', IncludeHandler, [])
.option('-m,--mirror <URL_MIRROR>', 'Where the binaries are downloaded from, defaults to http://dl.nwjs.io.')
.option('--output-name <NAME_OUTPUT>', 'Specify a template for output naming, defaults to {name}-{target}.')
.option('--executable-name <NAME_EXECUTABLE>', 'Specify the name for the final executable, defaults to manifest.name.')
.option('--with-ffmpeg', 'Fetch nwjs-ffmpeg-prebuilt to support .mp3 etc.')
.option('--side-by-side', 'Build application with side by side packaging.')
.option('--production', 'Reinstall dependencies for production purpose.')
.option('--win-ico <WIN_ICO>', 'Specify .ico for Windows build.')
.option('--mac-icns <MAC_ICNS>', 'Specify .icns for Mac OS X build.')
//.option('-f,--forceDownload', 'Force download of NW.js')
//.option('--cacheDir', 'The cache folder')
//.option('--quiet', 'Disables logging')
.action((pathOrArgs, command) => {

    const options = {
        version: typeof command.version == 'string' ? command.version : null,
        platforms: command.platforms,
        run: command.run,
        outputDir: command.outputDir,
        outputName: command.outputName,
        executableName: command.executableName,
        includes: command.include,
        withFFmpeg: command.withFfmpeg,
        sideBySide: command.sideBySide,
        production: command.production,
        winIco: command.winIco,
        macIcns: command.macIcns,
        mirror: command.mirror
    };

    NWB.commands.nwbuild(pathOrArgs, options);

});

if(process.argv.length <= 2) {
    commander.help();
}

commander.parse(process.argv);
