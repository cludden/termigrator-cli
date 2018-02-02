import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

import { createHandler } from '../utils';

export const command = 'down <version>';
export const describe = 'rollback to a prior version';
export const builder = {
  y: {
    alias: 'yes',
  },
};

/**
 * Run down migrations
 * @param  {Object} argv
 * @param  {Migrator} argv.migrator
 * @param  {Object} argv.version - endpoint
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({ emit, migrator, version: _version, yes }) => {
  let version = _version.toString();
  if (!version) {
    throw new Error('Missing required option "version"');
  }
  return migrator.getLastExecuted()
    .then((last) => {
      console.log();
      if (last === undefined) {
        console.log(colors.blue('No migrations available to run.'));
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
      // skip prompt if autoconfirmed
      if (yes === true) {
        return true;
      }
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

/**
 * Generate prompt from version
 * @param  {[type]} version [description]
 * @return {[type]}          [description]
 */
function createPrompt(version) {
  return colors.red(`Are you sure you want to rollback to ${version}?`);
}
