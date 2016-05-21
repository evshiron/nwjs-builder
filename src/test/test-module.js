
const { dirname, join } = require('path');

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
                platforms: 'win32,osx64',
                outputDir: join(DIR_TEST, '../nwb-test-build/'),
                withFfmpeg: true,
                sideBySide: true,
                production: true,
                macIcns: join(DIR_TEST, '../nwb-test/assets/nwb-test.icns'),
                winIco: join(DIR_TEST, '../nwb-test/assets/nwb-test.ico'),
            }, (err) => {

                if(err) throw err;

                done();

            });

        });

    });

});
