# nwjs-builder [![Travis CI](https://travis-ci.org/evshiron/nwjs-builder.svg)](https://travis-ci.org/evshiron/nwjs-builder) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/evshiron/nwjs-builder?svg=true)](https://ci.appveyor.com/project/evshiron/nwjs-builder) ![NPM Version](https://img.shields.io/npm/v/nwjs-builder.svg) ![NPM Downloads](https://img.shields.io/npm/dm/nwjs-builder.svg)

A command line utility for building nw.js applications, compatible with `nwjs/nw-builder`, and maybe better.

Tested to work for node.js [~~0.10/0.11/4.0/~~](https://github.com/evshiron/nwjs-builder/issues/9)4.1/5.0/6.0 on Windows, Linux and Mac OS X.

[![NPM](https://nodei.co/npm/nwjs-builder.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/nwjs-builder)

## Features

* Use `http://nwjs.io/versions.json` (powered by [evshiron/nwjs-download](https://github.com/evshiron/nwjs-download))
* Use ECMAScript 6
* Support
  * All major versions (listed in `versions.json`)
  * All platforms (win32, linux, darwin)
  * All flavors (normal, sdk, nacl, macappstore)
* Advanced options
  * Build with ffmpeg prebuilt
  * Build without packaging
  * Reinstall node modules for production
  * Replace icon, name, description and etc.
  * ...
* Actively maintained

## Install

```shell
$ npm install nwjs-builder -g
```

The `npm install evshiron/nwjs-builder` method is deprecated, which will no longer work because there is no prebuilt stuff in the repo, and `.npmignore` will simply ignore `./src/`, resulting in an empty installation.

## Usage

```
# Commands adapted from nwjs-download.

# List versions.
$ nwb list

# Show latest version.
$ nwb latest

# Show stable version.
$ nwb stable

# Show caches.
$ nwb caches

# Commands compatible with nw-builder.

$ nwb nwbuild -h

  Usage: nwbuild [options] [PATH_OR_ARGS...]

  Options:

    -h, --help                                output usage information
    -v,--version <VERSION>                    The nw.js version, eg. 0.8.4, defaults to the stable version.
    -p,--platforms <PLATFORMS>                Platforms to build, comma-sperated, eg. win32,win64,osx32,osx64,linux32,linux64, defaults to the current platform.
    -r,--run                                  Runs nw.js at PATH for the current platform.
    -o,--output-dir <DIR_OUTPUT>              The output directory, defaults to PATH's parent.
    -i,--include <DIR_SRC>:<GLOB>[:DIR_DEST]  Include extra files matching GLOB from DIR_SRC to DIR_BUILD/DIR_DEST.
    -m,--mirror <URL_MIRROR>                  Where the binaries are downloaded from, defaults to http://dl.nwjs.io.
    --output-name <NAME_OUTPUT>               Specify a template for output naming, defaults to {name}-{target}.
    --executable-name <NAME_EXECUTABLE>       Specify the name for the final executable, defaults to manifest.name.
    --output-format <DIR|ZIP>                 Specify the output format, defaults to DIR.
    --with-ffmpeg                             Fetch nwjs-ffmpeg-prebuilt to support .mp3 etc.
    --side-by-side                            Build application with side by side packaging.
    --production                              Reinstall dependencies for production purpose.
    --win-ico <WIN_ICO>                       Specify .ico for Windows build.
    --mac-icns <MAC_ICNS>                     Specify .icns for Mac OS X build.
    --detached                                For "--run", NWB exits after launching nw.js.

# Launch application.
$ nwb nwbuild -v 0.14.4-sdk -r ./build/

# Launch application with arguments.
$ nwb nwbuild -v 0.14.4-sdk -r ./build/ -a bbb

# Launch application with arguments and remote debugging enabled.
$ nwb nwbuild -v 0.14.4-sdk -r -- --remote-debugging-port=9222 ./build/ -a bbb

# Build application for win32,osx64.
$ nwb nwbuild -v 0.14.4-sdk -p win32,osx64 ./build/

# Build application for win32,osx64, with custom icons and without packaging.
$ nwb nwbuild -v 0.14.4-sdk -p win32 --win-ico app.ico --mac-icns app.icns --side-by-side ./build/
```

## Use As Module

`nwjs-builder` is able to work as a node.js module as well. The solution is somewhat tricky, but it works definitely.

```javascript
const NWB = require('nwjs-builder');
NWB.commands.nwbuild(path, options, callback);
```

The above code snippet directly calls the underneath command handler, and the `options` is a fake commander.js `command` object (as all we need are the options). A test named `test-module.js` is provided as a reference.

## Manifest Options

The following manifest options are used to modify executable information, powered by `atom/node-rcedit`.

```
{
    // Normal package.json properties.
    "name": "nwb-test",
    "version": "0.0.1",
    "description": "nwb-test",
    // Additional options.
    "nwjsBuilder": {
        // Optionally overwrite `name`, `version` and `description`.
        "productName": "",
        "productVersion": "",
        "fileDescription": "",
        // Other options.
        // For Windows.
        "copyright": "",
        "internalName": "",
        "fileVersion": "",
        "comments": "",
        "companyName": "",
        "legalTrademarks": "",
        "originalFilename": "",
        "privateBuild": "",
        "specialBuild": "",
        // For Mac OS X.
        "bundleIdentifier": ""
    }
}
```

## Development

I am still learning about how to form a modern node.js module well. As a result, the project structure might change from time to time.

While new features are added, some existing features might break too.

If anything doesn't work properly, feel free to open issues and provide enough information so that things can be quickly fixed.

PRs and issues are always appreciated.

**For feature requests:**

`nwjs-builder` is aimed at running/packaging nw.js applications, and is designed to work with a directory that is well-prepared to be packaged.

I will usually refuse requests for a feature which is achievable by other popular node.js modules, and you can use `build.sh`, `Makefile`, `gulp` or `grunt` to organize your building pipeline. I don't want to add an option just to proxy it to another module.

Platform-specified and configuration-rich features like making `.dmg` (Mac OS X only), `.exe` or `.deb` will usually be refused too. I don't want to learn how to integrate something I will rarely use and decide to leave it to you :)

See also:

* [CONTRIBUTING](./CONTRIBUTING.md)
* [evshiron/node-async-flow](https://github.com/evshiron/node-async-flow)
* [evshiron/nwjs-download](https://github.com/evshiron/nwjs-download)

## Mirrors

There are some mirrors available on the Internet, which are supported with `--mirror` option:
* https://npm.taobao.org/mirrors/nwjs/

## License

MIT.
