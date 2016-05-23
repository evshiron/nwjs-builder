
const cp = require('child_process');

describe('nwb', function() {

    describe('nwbuild -h', function() {

        this.timeout(30000);

        it('should print help and exit with code 0', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -h', function(err, stdout, stderr) {

                if(err) throw err;

                done();

            });

        });

    });

    describe('nwbuild -r', function() {

        this.timeout(60000);

        it('should launch and exit with code 233', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -v 0.14.4-sdk -r -- --remote-debugging-port=9222 ./assets/nwb-test/ 233', function(err, stdout, stderr) {

                //console.log(stdout);

                if(err && err.code == 233) return done();
                else if(err) throw err;
                else throw new Error('ERROR_EXIT_CODE_UNEXPECTED');

            });

        });

    });

});
