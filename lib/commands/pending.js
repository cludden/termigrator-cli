import colors from 'colors';

import { createHandler } from '../utils';

function createInfo(pending) {
  if (pending.length === 0) {
    return 'No pending migrations found, current environment is up to date.';
  }
  return `${pending.length} pending migrations found:`;
}

export const command = 'pending';
export const describe = 'list pending migrations';

/**
 * List pending migrations
 * @param  {Object} argv
 * @param  {Function} argv.emit
 * @param  {Migrator} argv.migrator
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({ emit, migrator }) => migrator.getPending()
  .then((pending) => {
    const info = createInfo(pending);
    console.log();
    console.log(colors.blue(info));
    return pending;
  })
  .each(version => console.log(colors.blue(`- ${version}`)))
  .then((versions) => {
    console.log();
    emit('pending', versions);
  }));
