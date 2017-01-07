import Bluebird from 'bluebird';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import Cli from '../../lib/index';
import migrator, { migrations, store } from '../migrator';

const cli = new Cli({ version: '1.0.0', migrator });

function sendLine(line) {
  setTimeout(function () {
    process.stdin.emit('data', `${line}\n`);
  }, 200);
}

describe('Cli', function () {
  it('current', function () {
    return new Bluebird((resolve) => {
      cli.once('current', function (current) {
        expect(current).to.equal(undefined);
        resolve();
      });
      cli.start(['node', 'test', 'current']);
    });
  });

  it('pending', function () {
    return new Bluebird((resolve) => {
      cli.once('pending', function (pending) {
        expect(pending).to.deep.equal(migrations);
        resolve();
      });
      cli.start(['node', 'test', 'pending']);
    });
  });

  it('up (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal([]);
        resolve();
      });
      cli.start(['node', 'test', 'up']);
      sendLine('no');
    });
  });

  it('up (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal(migrations);
        resolve();
      });
      cli.start(['node', 'test', 'up']);
      sendLine('yes');
    });
  });

  it('down (missing --to)', function () {
    return cli.start(['node', 'test', 'down'])
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

  it('down --to BEGINNING (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('down', (executed) => {
        expect(executed).to.deep.equal([]);
        expect(store.getVersion()).to.equal(migrations[migrations.length - 1], 10);
        resolve();
      });
      cli.start(['node', 'test', 'down', '--to', 'BEGINNING']);
      sendLine('no');
    });
  });

  it('down --to BEGINNING (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('down', (executed) => {
        expect(executed).to.deep.equal(migrations.slice().reverse());
        expect(store.getVersion()).to.equal(undefined);
        resolve();
      });
      cli.start(['node', 'test', 'down', '--to', 'BEGINNING']);
      sendLine('yes');
    });
  });

  it('up --to 2 (confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('up', (executed) => {
        expect(executed).to.deep.equal(['1', '2']);
        expect(store.getVersion()).to.equal('2');
        resolve();
      });
      cli.start(['node', 'test', 'up', '--to', '2']);
      sendLine('yes');
    });
  });

  it('goto 4 (not confirmed)', function () {
    return new Bluebird((resolve) => {
      cli.once('goto', (executed) => {
        expect(executed).to.deep.equal([]);
        expect(store.getVersion()).to.equal('2');
        resolve();
      });
      cli.start(['node', 'test', 'goto', '4']);
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
      cli.start(['node', 'test', 'goto', '4']);
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
      cli.start(['node', 'test', 'exec', '5', 'up']);
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
      cli.start(['node', 'test', 'exec', '5', 'up']);
      sendLine('yes');
    });
  });

  describe('#createMigrator', function () {
    it('synchronous', function () {
      return new Bluebird((resolve) => {
        cli.initialize = sinon.stub();
        cli.createMigrator = function createMigrator() {
          return migrator;
        };
        cli.once('down', () => {
          expect(cli.initialize.callCount).to.equal(1);
          expect(cli.migrator).to.equal(migrator);
          resolve();
        });
        cli.start(['node', 'test', 'down', '--to', '4']);
        sendLine('yes');
      });
    });

    it('asynchronous', function () {
      return new Bluebird((resolve) => {
        cli.initialize = sinon.stub();
        cli.createMigrator = function createMigrator() {
          return new Promise((_resolve) => {
            setTimeout(() => {
              _resolve(migrator);
            }, 0);
          });
        };
        cli.once('up', () => {
          expect(cli.initialize.callCount).to.equal(1);
          expect(cli.migrator).to.equal(migrator);
          resolve();
        });
        cli.start(['node', 'test', 'up', '--to', '5']);
        sendLine('yes');
      });
    });
  });
});
