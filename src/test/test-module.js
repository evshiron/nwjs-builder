
const { dirname, join } = require('path');
const { existsSync } = require('fs');

const NWB = require('../');

// Assume the project root is process.cwd().
const DIR_TEST = dirname(module.filename);

describe('module', function() {

    describe('nwbuild#build', function() {

        this.timeout(300000);

        it('should build in "./temp/build/"', function(done) {

            NWB.commands.nwbuild('./assets/nwb-test/', {
                // Here we fake a command object.
                //run: true,
                version: '0.14.4-sdk',
                platforms: 'win32,linux32,osx64',
                outputDir: './temp/build/',
                include: [
                    // cp -r ./README.md ${DIR_BUILD}/README.md
                    ['./', 'README.md', './'],
                    // cp -r ./lib/build/*.js ${DIR_BUILD}/
                    ['./lib/build/', '*.js', './'],
                    // cp -r ./lib/ ${DIR_BUILD}/
                    ['./', 'lib/**/*.js', './']
                ],
                withFfmpeg: true,
                sideBySide: true,
                production: true,
                macIcns: './assets/nwb-test.icns',
                winIco: './assets/nwb-test.ico',
            }, (err) => {

                if(err) throw err;

                if(!existsSync('./temp/build/nwb-test-win-ia32/README.md')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/win32.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/linux.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/darwin.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/lib/index.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/lib/build/win32.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/lib/build/linux.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-win-ia32/lib/build/darwin.js')) throw('ERROR_FILE_NOT_EXISTS');

                done();

            });

        });

    });

    describe('nwbuild#run', function() {

        this.timeout(300000);

        it('should launch and exit with code 233', function(done) {

            NWB.commands.nwbuild(['--remote-debugging-port=9222', './assets/nwb-test/', '233'], {
                run: true,
                version: '0.14.4-sdk'
            }, (err, code) => {

                if(err) throw err;
                else if(code == 233) return done();
                else throw new Error('ERROR_EXIT_CODE_UNEXPECTED');

            });

        });

    });

});
