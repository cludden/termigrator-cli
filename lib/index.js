import 'source-map-support/register';

import Bluebird from 'bluebird';
import EventEmitter from 'events';
import program from 'commander';
import { Migrator } from 'termigrator';

import {
  current,
  down,
  exec,
  goto,
  pending,
  up,
} from './commands';

/**
 * Cli class for migrator instance
 * @extends EventEmitter
 */
export default class Cli extends EventEmitter {
  constructor({ version, migrator, initialize }) {
    super();
    if (typeof version !== 'string') {
      throw new Error('args.version is required and must be a string');
    }
    if (!(migrator instanceof Migrator)) {
      throw new Error('args.migrator must be an instance of Termigrator.Migrator');
    } else {
      this.migrator = migrator;
    }
    if (typeof initialize !== 'function') {
      this.initialize = () => Bluebird.resolve();
    } else {
      this.initialize = () => Bluebird.try(() => initialize());
    }

    program.version(version);

    program.command('current')
    .description('list the last executed migration')
    .action(current.bind(this));

    program.command('down')
    .description('rollback to a prior state')
    .option('-t, --to [version]', 'exclusive stop point')
    .action(down.bind(this));

    program.command('exec <id> <method>')
    .description('execute a single migration')
    .option('-s, --silent', 'skip logging')
    .action(exec.bind(this));

    program.command('goto <version>')
    .description('goto the specified state')
    .action(goto.bind(this));

    program.command('pending')
    .description('list all pending migrations')
    .action(pending.bind(this));

    program.command('up')
    .description('run pending migrations')
    .option('-t, --to [version]', 'migration upper limit')
    .action(up.bind(this));

    this.program = program;
  }

  /**
   * Initialize and start the cli program
   * @return  {Bluebird} bluebird
   */
  start() {
    return this.initialize()
    .then(() => this.program.parse(process.argv));
  }
}
