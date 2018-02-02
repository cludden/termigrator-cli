import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

import { createHandler } from '../utils';

export const command = 'goto <version>';
export const describe = 'move from the current version to the specified version';
export const builder = {
  y: {
    alias: 'yes',
  },
};

/**
 * Migrate to a specific state from the current state
 * @param  {Object} argv
 * @param  {Function} argv.emit
 * @param  {Migrator} argv.migrator
 * @param  {String} argv.version
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({ emit, migrator, version: _version, yes }) => {
  const version = _version.toString();
  let dir;
  return migrator.getGotoVersions(version)
    .spread((direction, pending) => {
      dir = direction;
      const info = createInfo({ direction, pending, version });
      console.log();
      console.log(colors.blue(info));
      return pending;
    })
    .each(id => console.log(colors.blue(`- ${id}`)))
    .then(() => {
      if (yes === true) {
        return true;
      }
      console.log();
      const msg = 'Are you sure you want to migrate?';
      const prompt = colors[dir === 'down' ? 'red' : 'blue'](msg);
      return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
    })
    .then((confirmed) => {
      if (confirmed === false) {
        return [];
      }
      return migrator.goto(version);
    })
    .then((executed) => {
      emit('goto', executed);
    });
});

/**
 * Generate an appropriate info statement
 * @param  {Object} args
 * @param  {String} args.direction
 * @param  {String} args.pending
 * @param  {String} args.version
 * @return {String} info
 * @private
 */
function createInfo({ direction, pending, version }) {
  if (pending.length === 0) {
    return 'No migrations found, current environment is up to date';
  }
  return `${pending.length} ${direction} migrations found in between the current version and ${version}`;
}
