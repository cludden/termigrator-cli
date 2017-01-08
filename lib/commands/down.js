import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

import { createHandler } from '../utils';

/**
 * Generate prompt from version
 * @param  {[type]} version [description]
 * @return {[type]}          [description]
 */
function createPrompt(version) {
  return colors.red(`Are you sure you want to rollback to ${version}?`);
}

export const command = 'down <version>';
export const describe = 'rollback to a prior version';

/**
 * Run down migrations
 * @param  {Object} argv
 * @param  {Migrator} argv.migrator
 * @param  {Object} argv.version - endpoint
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({ emit, migrator, version }) => {
  if (!version) {
    throw new Error('Missing required option "version"');
  }
  return migrator.getLastExecuted()
  .then((last) => {
    if (last === undefined) {
      return false;
    }
    let endpoint = version;
    if (/^beginning$/gi.test(version)) {
      endpoint = 'the beginning';
      version = undefined; // eslint-disable-line
    }
    const prompt = createPrompt(endpoint);
    console.log();
    console.log(colors.blue(`The last executed migration was ${last}.`));
    return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
  })
  .then((confirmed) => {
    if (confirmed === false) {
      return [];
    }
    return migrator.down({ to: version });
  })
  .then((executed) => {
    console.log();
    emit('down', executed);
  });
});
