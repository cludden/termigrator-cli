import 'source-map-support/register';

import Bluebird from 'bluebird';
import colors from 'colors';
import program from 'commander';

import current from './commands/current';
import down from './commands/down';
import exec from './commands/exec';
import goto from './commands/goto';
import pending from './commands/pending';
import up from './commands/up';

export function createWrapper({ initialize, migrator }) {
  return command => (...args) => Bluebird.try(() => {
    if (typeof initialize === 'function') {
      return initialize();
    }
    return null;
  })
  .then(() => {
    const options = args.pop();
    return command({ migrator, options }, ...args);
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(colors.red(err.message));
    process.exit(1);
  });
}

/**
 * Create a cli program using a Migrator instance
 * @param  {Object} args
 * @param  {String} args.version - cli version
 * @param  {Object} args.migrator - termigrator instance
 * @param  {Function} [args.initialize] - initialize function that returns a promise
 * @return {Object} cli
 */
export function createCli({ version, migrator, initialize }) {
  if (typeof version !== 'string') {
    throw new Error('args.version is required and must be a string');
  }

  const createActionWithCommand = createWrapper({ initialize, migrator });

  program.version(version);

  program.command('current')
  .description('list the last executed migration')
  .action(createActionWithCommand(current));

  program.command('down')
  .description('rollback to a prior state')
  .option('-t, --to [version]', 'exclusive stop point')
  .action(createActionWithCommand(down));

  program.command('exec <id> <method>')
  .description('execute a single migration')
  .option('-s, --silent', 'skip logging')
  .action(createActionWithCommand(exec));

  program.command('goto <version>')
  .description('goto the specified state')
  .action(createActionWithCommand(goto));

  program.command('pending')
  .description('list all pending migrations')
  .action(createActionWithCommand(pending));

  program.command('up')
  .description('run pending migrations')
  .option('-t, --to [version]', 'migration upper limit')
  .action(createActionWithCommand(up));

  if (process.argv.length <= 2) {
    program.outputHelp();
  }

  return {
    program,
    start() {
      program.parse(process.argv);
    },
  };
}
