import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

import { createHandler } from '../utils';

export const command = 'exec <version> <direction>';
export const describe = 'execute a single migration in the specified direction';

export const builder = {
  s: {
    alias: 'silent',
    default: false,
    describe: 'skip logging',
    type: 'boolean',
  },
  y: {
    alias: 'yes',
  },
};

/**
 * Execute a single migration
 * @param  {Object} argv
 * @param  {Migrator} argv.direction
 * @param  {Function} argv.emit
 * @param  {String} argv.migrator
 * @param  {Boolean} [argv.silent=false]
 * @param  {String} argv.version
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({
  direction, emit, migrator, silent, version: _version, yes,
}) => {
  const version = _version.toString();
  return Bluebird.try(() => {
    if (yes === true) {
      return true;
    }
    console.log();
    const prompt = createPrompt(version, direction);
    return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
  })
    .then((confirmed) => {
      console.log();
      if (confirmed === false) {
        return undefined;
      }
      return migrator.execute(version, direction, { log: silent });
    })
    .then((executed) => {
      emit('exec', executed, executed === undefined ? undefined : direction);
    });
});

function createPrompt(id, direction) {
  return colors.red(`Are you sure you want to execute migration ${id} (${direction})?`);
}
