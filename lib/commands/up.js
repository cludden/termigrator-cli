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
export default function up(options) {
  return Bluebird.all([
    this.migrator.getMigrations(),
    this.migrator.getLastExecuted(),
  ])
  .then(([migrations, last]) => {
    const lastIndex = migrations.findIndex(m => m === last);
    if (lastIndex === -1) {
      return utils.getSection(migrations, 'up', migrations[0], options.to);
    }
    return utils.getSection(migrations, 'up', last, options.to);
  })
  .then((pending) => {
    if (!pending || !pending.length) {
      return false;
    }
    const prompt = 'Are you sure you want to migrate?';
    return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
  })
  .then((confirmed) => {
    if (confirmed === false) {
      return [];
    }
    return this.migrator.up(options);
  })
  .then((executed) => {
    this.emit('up', executed);
  });
}
