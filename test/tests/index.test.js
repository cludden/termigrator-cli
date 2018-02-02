import Bluebird from 'bluebird';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import Cli from '../../lib/index';
import migrator, { migrations, store } from '../migrator';


function exec(cli, args) {
  return cli.start(args);
}

function sendLine(line) {
  setTimeout(function () {
    process.stdin.emit('data', `${line}\n`);
  }, 200);
}

describe('Cli', function () {
  const cli = new Cli({
    version: '1.0.0',
    configure(yargs) {
      return yargs.exitProcess(false).reset();
    },
    migrator,
  });

  it('current', function () {
    return new Bluebird((resolve) => {
      cli.once('current', function (current) {
        expect(current).to.equal(undefined);
        resolve();
      });
      exec(cli, ['current']);
    });
  });

  it('pending', function () {
    return new Bluebird((resolve) => {
      cli.once('pending', function (pending) {
        expect(pending).to.deep.equal(migrations);
        resolve();
      });
      exec(cli, ['pending']);
    });
  });

  it('up (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal([]);
        resolve();
      });
      exec(cli, ['up']);
      sendLine('no');
    });
  });

  it('up (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal(migrations);
        resolve();
      });
      exec(cli, ['up']);
      sendLine('yes');
    });
  });

  it('down (missing version)', function () {
    return Bluebird.try(() => exec(cli, ['down']))
      .then(() => {
        throw new Error('SHOULD FAIL');
      })
      .catch((err) => {
        if (err.message === 'SHOULD FAIL') {
          throw err;
        }
        expect(err).to.be.an('error');
      });
  });

  it('down BEGINNING (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('down', (executed) => {
        expect(executed).to.deep.equal([]);
        expect(store.getVersion()).to.equal(migrations[migrations.length - 1], 10);
        resolve();
      });
      exec(cli, ['down', 'BEGINNING']);
      sendLine('no');
    });
  });

  it('down BEGINNING (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('down', (executed) => {
        expect(executed).to.deep.equal(migrations.slice().reverse());
        expect(store.getVersion()).to.equal(undefined);
        resolve();
      });
      exec(cli, ['down', 'BEGINNING']);
      sendLine('yes');
    });
  });

  it('up 2 (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal(['1', '2']);
        expect(store.getVersion()).to.equal('2');
        resolve();
      });
      exec(cli, ['up', '2']);
      sendLine('yes');
    });
  });

  it('up 2 (nothing to execute)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal([]);
        expect(store.getVersion()).to.equal('2');
        resolve();
      });
      exec(cli, ['up', '2']);
    });
  });

  it('goto 4 (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('goto', (executed) => {
        expect(executed).to.deep.equal([]);
        expect(store.getVersion()).to.equal('2');
        resolve();
      });
      exec(cli, ['goto', '4']);
      sendLine('no');
    });
  });

  it('goto 4 (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('goto', (executed) => {
        expect(executed).to.deep.equal(['3', '4']);
        expect(store.getVersion()).to.equal('4');
        resolve();
      });
      exec(cli, ['goto', '4']);
      sendLine('yes');
    });
  });

  it('exec 5 up (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('exec', (executed, direction) => {
        expect(executed).to.equal(undefined);
        expect(direction).to.equal(undefined);
        expect(store.getVersion()).to.equal('4');
        resolve();
      });
      exec(cli, ['exec', '5', 'up']);
      sendLine('no');
    });
  });

  it('exec 5 up (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('exec', (executed, direction) => {
        expect(executed).to.equal('5');
        expect(direction).to.equal('up');
        expect(store.getVersion()).to.equal('5');
        resolve();
      });
      exec(cli, ['exec', '5', 'up']);
      sendLine('yes');
    });
  });

  it('down BEGINNING (autoconfirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('down', (executed) => {
        expect(executed).to.deep.equal(migrations.slice().reverse());
        expect(store.getVersion()).to.equal(undefined);
        resolve();
      });
      exec(cli, ['down', 'BEGINNING', '-y']);
    });
  });

  it('up 5 (autoconfirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal(migrations.slice());
        expect(store.getVersion()).to.equal('5');
        resolve();
      });
      exec(cli, ['up', '5', '-y']);
    });
  });

  it('goto 4 (autoconfirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('goto', (executed) => {
        expect(executed).to.deep.equal(['5']);
        expect(store.getVersion()).to.equal('4');
        resolve();
      });
      exec(cli, ['goto', '4', '-y']);
    });
  });

  it('exec 5 up (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('exec', (executed, direction) => {
        expect(executed).to.equal('5');
        expect(direction).to.equal('up');
        expect(store.getVersion()).to.equal('5');
        resolve();
      });
      exec(cli, ['exec', '5', 'up', '-y']);
    });
  });

  describe('#createMigrator', function () {
    it('synchronous', function () {
      const options = {
        createMigrator() {
          return migrator;
        },
      };
      const sandbox = sinon.sandbox.create();
      sandbox.spy(migrator, 'down');
      sandbox.spy(options, 'createMigrator');
      return new Bluebird((resolve) => {
        const testCli = new Cli(options);
        testCli.once('down', () => {
          expect(options.createMigrator.callCount).to.equal(1);
          expect(migrator.down.callCount).to.equal(1);
          sandbox.restore();
          resolve();
        });
        exec(testCli, ['down', '4']);
        sendLine('yes');
      });
    });

    it('asynchronous', function () {
      const options = {
        createMigrator() {
          return new Promise((_resolve) => {
            setTimeout(() => {
              _resolve(migrator);
            }, 0);
          });
        },
      };
      const sandbox = sinon.sandbox.create();
      sandbox.spy(migrator, 'up');
      sandbox.spy(options, 'createMigrator');
      return new Bluebird((resolve) => {
        const testCli = new Cli(options);
        testCli.once('up', () => {
          expect(options.createMigrator.callCount).to.equal(1);
          expect(migrator.up.callCount).to.equal(1);
          sandbox.restore();
          resolve();
        });
        exec(testCli, ['up', '5']);
        sendLine('yes');
      });
    });
  });
});
