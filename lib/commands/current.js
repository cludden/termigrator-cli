import colors from 'colors';

import { createHandler } from '../utils';

const initialized = last => `The last executed migration was ${last}.`;
const uninitialized = 'It doesn\'t look like any migrations have been executed.';

export const command = 'current';
export const describe = 'list the current version';

/**
 * List the last executed migration
 * @param  {Object} argv
 * @param  {Fucntion} argv.emit
 * @param  {Migrator} argv.migrator
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({ emit, migrator }) => migrator.getLastExecuted()
.then((last) => {
  const msg = last === undefined ? uninitialized : initialized(last);
  console.log();
  console.log(colors.blue(msg));
  console.log();
  emit('current', last);
}));
