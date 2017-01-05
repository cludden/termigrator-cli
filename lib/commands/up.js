import Bluebird from 'bluebird';
import promptly from 'promptly';
import { utils } from 'termigrator';

/**
 * Run pending migrations
 * @param  {Object} args
 * @param  {Object} args.migrator
 * @param  {Object} [args.options={}]
 * @return {Bluebird} bluebird
 */
export default function up({ migrator, options = {} }) {
  return Bluebird.all([
    migrator.getMigrations(),
    migrator.getLastExecuted(),
  ])
  .then(([migrations, last]) => utils.getSection(migrations, 'up', last, options.to))
  .then((pending) => {
    if (!pending || !pending.length) {
      return false;
    }
    const prompt = 'Are you sure you want to migrate?';
    return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
  })
  .then((confirmed) => {
    if (confirmed === false) {
      return undefined;
    }
    return migrator.up(options);
  });
}
