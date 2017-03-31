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
    this.version = version;
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
      this.configure = configure;
    } else {
      this.configure = program => program;
    }
  }

  start(args) {
    return Bluebird.try(() => {
      const context = {
        migrator: this.migrator,
        createMigrator: this.createMigrator ? this.createMigrator.bind(this) : undefined,
        emit: this.emit.bind(this),
      };
      const program = this.configure(yargs());
      program.version(this.version)
      .command(current)
      .command(down)
      .command(exec)
      .command(goto)
      .command(pending)
      .command(up)
      .demandCommand(1)
      .help();
      if (args && args.length) {
        return program.parse(args, context);
      }
      return program.parse(process.argv.slice(2), context);
    });
  }
}
