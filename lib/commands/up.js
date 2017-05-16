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
export const handler = createHandler(({ emit, migrator, version: _version }) => {
  const version = _version ? _version.toString() : undefined;
  return migrator.getMigrations()
  .then((migrations) => {
    const to = _version || migrations[migrations.length - 1];
    return migrator.getGotoVersions(to.toString());
  })
  .then(([, pending]) => {
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
  });
});
