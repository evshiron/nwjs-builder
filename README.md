# nwjs-builder

A command line utility for building nw.js applications, compatible with `nwjs/nw-builder`, and maybe better.

node.js 4.x+ is required.

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

This project is still in early stage and currently lacks building for Linux support (which should be very same as for Windows but I don't have a Linux VM so...).

PRs and issues are appreciated.

See also:

* [evshiron/node-flow](https://github.com/evshiron/node-flow)
* [evshiron/nwjs-download](https://github.com/evshiron/nwjs-download)

## License

MIT.
