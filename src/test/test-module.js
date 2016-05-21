
const { dirname, join } = require('path');
const { existsSync } = require('fs');

const NWB = require('../');

// Because `npm test` is run from `../`, we depend on absolute path instead of `process.cwd()`.
const DIR_TEST = dirname(module.filename);

describe('module', function() {

    describe('nwbuild', function() {

        this.timeout(60000);

        it('should build in "../nwb-test-build/"', function(done) {

            NWB.commands.nwbuild(join(DIR_TEST, '../nwb-test/'), {
                // Here we fake a command object.
                //run: true,
                version: '0.14.4-sdk',
                platforms: 'win32,linux32,osx64',
                outputDir: join(DIR_TEST, '../nwb-test-build/'),
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
                macIcns: join(DIR_TEST, '../nwb-test/assets/nwb-test.icns'),
                winIco: join(DIR_TEST, '../nwb-test/assets/nwb-test.ico'),
            }, (err) => {

                if(err) throw err;

                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/README.md')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/win32.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/linux.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/darwin.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/lib/index.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/lib/build/win32.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/lib/build/linux.js')) throw('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./nwb-test-build/nwb-test-win-ia32/lib/build/darwin.js')) throw('ERROR_FILE_NOT_EXISTS');

                done();

            });

        });

    });

});
