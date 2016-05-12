# nwjs-builder

A command line utility for building nw.js applications, compatible with `nwjs/nw-builder`, and maybe better.

node.js 4.1+ is required.

## Features

* Use `http://nwjs.io/versions.json` (powered by [evshiron/nwjs-download](https://github.com/evshiron/nwjs-download))
* Use ECMAScript 6 (in my opinion)
* Support
  * All major versions (listed in `versions.json`)
  * All platforms (win32, linux, darwin)
  * All flavors (normal, sdk, nacl, macappstore)
* Active

## Install

```shell
$ npm install evshiron/nwjs-builder -g
```

## Usage

```shell
$ nwb nwbuild -h

  Usage: nwbuild [options] [path]

  Options:

    -h, --help                  output usage information
    -v,--version <version>      The nw version, eg. 0.8.4
    -p,--platforms <platforms>  Platforms to build, comma-sperated, can be: win32,win64,osx32,osx64,linux32,linux64
    -r,--run                    Runs NW.js for the current platform

# Launch application.
$ nwb nwbuild -v 0.14.4-sdk -r ./build/

# Build application for win32,osx64.
$ nwb nwbuild -v 0.14.4-sdk -p win32,osx64 ./build/
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
