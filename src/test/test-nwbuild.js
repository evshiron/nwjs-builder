
const assert = require('assert');

const cp = require('child_process');

describe('nwb', function() {

    describe('download', function() {

        this.timeout(120000);

        it('should print the stable version and exit with code 0', function(done) {

            cp.exec('node ./bin/nwb.js stable', function(err, stdout, stderr) {

                if(err) throw err;

                done();

            });

        });

        it('should download the stable version and exit with code 0', function(done) {

            cp.exec('node ./bin/nwb.js download', function(err, stdout, stderr) {

                if(err) throw err;

                done();

            });

        });

    });

    describe('nwbuild -h', function() {

        it('should print help and exit with code 0', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -h', function(err, stdout, stderr) {

                if(err) throw err;

                done();

            });

        });

    });

    describe('nwbuild -r', function() {

        this.timeout(15000);

        it('should launch and exit with code 233', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -r ./nwb-test/', function(err, stdout, stderr) {

                if(err && err.code == 233) return done();
                else if(err) throw err;
                else throw new Error('ERROR_EXIT_CODE_UNEXPECTED');

            });

        });

    });

});
