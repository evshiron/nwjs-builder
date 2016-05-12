
'use strict';

const { resolve } = require('path');

const { ParseNwBuilderVersion } = require('./nwbuild');

const NWD = require('nwjs-download');

const Flow = require('node-flow');

const NWB = require('../');

const NwBuilderBuild = (path, command) => {

    Flow(function*(cb) {

        const options = {
            version: null,
            flavor: null,
            targets: [],
            path: null
        };

        var [err, version, flavor] = yield ParseNwBuilderVersion(command.version, cb.expect(3));

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
                flavor: options.flavor
            };

            let [err, fromCache, fromDone, binaryDir] = yield NWB.DownloadAndExtractBinary({
                version: options.version,
                platform: platform,
                arch: arch,
                flavor: options.flavor
            }, cb.expect(4));

            if(err) {
                console.error(err);
                return;
            }

            switch(NWD.GetPlatform(platform)) {
            case 'win32':

                {

                    let [err, path] = yield NWB.BuildWin32Binary(options.path, binaryDir, options.version, NWD.GetPlatform(platform), NWD.GetArch(arch), {
                        withFFmpeg: command.withFfmpeg ? true : false,
                        sideBySide: command.sideBySide ? true : false,
                        production: command.production ? true : false
                    }, cb.expect(2));

                    if(err) {
                        console.error(err);
                        return;
                    }

                    console.log(`${ NWD.GetTarget(platform, arch) } build: ${ resolve(path) }.`);

                }

                break;
            case 'linux':

                {

                    let [err, path] = yield NWB.BuildLinuxBinary(options.path, binaryDir, options.version, NWD.GetPlatform(platform), NWD.GetArch(arch), {
                        withFFmpeg: command.withFfmpeg ? true : false,
                        sideBySide: command.sideBySide ? true : false,
                        production: command.production ? true : false
                    }, cb.expect(2));

                    if(err) {
                        console.error(err);
                        return;
                    }

                    console.log(`${ NWD.GetTarget(platform, arch) } build: ${ resolve(path) }.`);

                }

                break;
            case 'darwin':

                {

                    let [err, path] = yield NWB.BuildDarwinBinary(options.path, binaryDir, options.version, NWD.GetPlatform(platform), NWD.GetArch(arch), {
                        withFFmpeg: command.withFfmpeg ? true : false,
                        sideBySide: command.sideBySide ? true : false,
                        production: command.production ? true : false
                    }, cb.expect(2));

                    if(err) {
                        console.error(err);
                        return;
                    }

                    console.log(`${ NWD.GetTarget(platform, arch) } build: ${ resolve(path) }.`);

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

        var [err, version, flavor] = yield ParseNwBuilderVersion(command.version, cb.expect(3));

        if(err) {
            console.error(err);
            return;
        }

        options.version = version;
        options.flavor = flavor;

        // Parse path.

        options.path = path ? path : '.';

        console.log(options);

        var [err, fromCache, fromDone, binaryDir] = yield NWB.DownloadAndExtractBinary({
            version: options.version,
            platform: options.platform,
            arch: options.arch,
            flavor: options.flavor
        }, cb.expect(4));

        if(err) {
            console.error(err);
            return;
        }

        const executable = NWB.GetExecutable(binaryDir, options.platform);

        var [err, code] = yield NWB.LaunchExecutable(executable, options.path, cb.expect(2));

        if(err) {
            console.error(err);
            return;
        }

        console.log(`nw.js exits with code ${ code }.`);

    });

};

const nwbuild = (path, command) => {

    if(command.run) {

        NwBuilderRun(path, command);

    }
    else {

        NwBuilderBuild(path, command);

    }

}

Object.assign(module.exports, {
    nwbuild
});
