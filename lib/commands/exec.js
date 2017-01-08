import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

import { createHandler } from '../utils';

function createPrompt(id, direction) {
  return colors.red(`Are you sure you want to execute migration ${id} (${direction})?`);
}

export const command = 'exec <version> <direction>';
export const describe = 'execute a single migration in the specified direction';

export const builder = {
  s: {
    alias: 'silent',
    default: false,
    describe: 'skip logging',
    type: 'boolean',
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
const handler = createHandler(({ direction, emit, migrator, silent, version }) => {
  const prompt = createPrompt(version, direction);
  console.log();
  return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done))
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
export { handler };
