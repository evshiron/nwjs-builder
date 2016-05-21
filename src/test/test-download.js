
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

});
