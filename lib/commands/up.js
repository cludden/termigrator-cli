import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';
import { utils } from 'termigrator'; // eslint-disable-line

import { createHandler } from '../utils';

export const command = 'up [version]';
export const describe = 'migrate';

/**
 * Run pending migrations
 * @param  {Object} argv
 * @param  {Function} argv.emit
 * @param  {Object} argv.migrator
 * @param  {String} [argv.version]
 * @return {Bluebird} bluebird
 */
export const handler = createHandler(({ _, emit, migrator, version }) => Bluebird.all([
  migrator.getMigrations(),
  migrator.getLastExecuted(),
])
.then(([migrations, last]) => {
  console.log(last, version, _);
  const lastIndex = migrations.findIndex(m => m === last);
  if (lastIndex === -1) {
    return utils.getSection(migrations, 'up', migrations[0], version);
  }
  return utils.getSection(migrations, 'up', last, version);
})
.then((pending) => {
  const end = version || 'the most recent version';
  console.log();
  if (!pending || !pending.length) {
    console.log(colors.blue(`No migrations found between the current version and ${end}.`));
    return false;
  }
  console.log(colors.blue(`${pending.length} migrations found between the current version and ${end}:`));
  pending.forEach(v => console.log(colors.blue(`- ${v}`)));
  console.log();
  const prompt = colors.blue('Are you sure you want to migrate?');
  return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
})
.then((confirmed) => {
  if (confirmed === false) {
    return [];
  }
  return migrator.up({ to: version });
})
.then((executed) => {
  console.log();
  emit('up', executed);
}));
