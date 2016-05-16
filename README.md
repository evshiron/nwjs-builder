# nwjs-builder [![Travis CI](https://travis-ci.org/evshiron/nwjs-builder.svg)](https://travis-ci.org/evshiron/nwjs-builder) ![NPM Version](https://img.shields.io/npm/v/nwjs-builder.svg) ![NPM Downloads](https://img.shields.io/npm/dm/nwjs-builder.svg)

> A command line utility for building nw.js applications, compatible with `nwjs/nw-builder`, and maybe better.
>
> node.js 4.1+ is required.

[![NPM](https://nodei.co/npm/nwjs-builder.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/nwjs-builder)

## Features

* Use `http://nwjs.io/versions.json` (powered by [evshiron/nwjs-download](https://github.com/evshiron/nwjs-download))
* Use (limited) ECMAScript 6
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
$ npm install evshiron/nwjs-builder -g
```

## Usage

```shell
# List versions.
$ nwd list

# Show latest version.
$ nwd latest

# Show stable version.
$ nwd stable

# Show caches.
$ nwd caches

$ nwb nwbuild -h

  Usage: nwbuild [options] [path]

  Options:

    -h, --help                  output usage information
    -v,--version <version>      The nw version, eg. 0.8.4
    -p,--platforms <platforms>  Platforms to build, comma-sperated, can be: win32,win64,osx32,osx64,linux32,linux64
    -r,--run                    Runs NW.js for the current platform
    --with-ffmpeg               Fetch nwjs-ffmpeg-prebuilt to support .mp3 etc.
    --side-by-side              Build application with side by side packaging.
    --production                Reinstall dependencies for production purpose.
    --win-ico <winIco>          Specify .ico for Windows build.
    --mac-icns <macIcns>        Specify .icns for Mac OS X build.

# Launch application.
$ nwb nwbuild -v 0.14.4-sdk -r ./build/

# Build application for win32,osx64.
$ nwb nwbuild -v 0.14.4-sdk -p win32,osx64 ./build/

# Build application for win32,osx64, with custom icons and without packaging.
$ nwb nwbuild -v 0.14.4-sdk -p win32 --win-ico app.ico --mac-icns app.icns --side-by-side ./build/
```

## Development

This project is still in __early stage__, although everything should just work.

Welcome to try it out, but __use it on your own risk when used in production__.

PRs and issues are appreciated.

See also:

* [evshiron/node-flow](https://github.com/evshiron/node-flow)
* [evshiron/nwjs-download](https://github.com/evshiron/nwjs-download)

## License

MIT.
