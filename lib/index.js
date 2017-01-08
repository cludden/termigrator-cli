import 'source-map-support/register';

import Bluebird from 'bluebird';
import EventEmitter from 'events';
import { Migrator } from 'termigrator';
import yargs from 'yargs';

import * as current from './commands/current';
import * as down from './commands/down';
import * as exec from './commands/exec';
import * as goto from './commands/goto';
import * as pending from './commands/pending';
import * as up from './commands/up';

/**
 * Cli class for migrator instance
 * @extends EventEmitter
 */
export default class Cli extends EventEmitter {
  constructor({ configure, createMigrator, initialize, migrator, version }) {
    super();
    yargs.version(version);
    if (!(migrator instanceof Migrator) && typeof createMigrator !== 'function') {
      throw new Error('Invalid migrator/createMigrator options');
    } else {
      this.migrator = migrator;
      this.createMigrator = createMigrator;
    }
    if (typeof initialize === 'function') {
      this.initialize = Bluebird.resolve(() => initialize.call(this));
    } else {
      this.initialize = Bluebird.resolve();
    }
    if (typeof configure === 'function') {
      configure(yargs);
    }
    yargs.command(current)
    .command(down)
    .command(exec)
    .command(goto)
    .command(pending)
    .command(up)
    .help();
    this._program = yargs;
  }

  start(args) {
    return Bluebird.try(() => {
      const context = {
        migrator: this.migrator,
        createMigrator: this.createMigrator.bind(this),
        emit: this.emit.bind(this),
      };
      if (args && args.length) {
        return this._program.parse(args, context);
      }
      return this._program.parse(process.argv, context);
    });
  }
}
