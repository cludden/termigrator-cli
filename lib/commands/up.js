import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';
import { utils } from 'termigrator'; // eslint-disable-line

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
    const end = options.to || 'the most recent version';
    console.log();
    if (!pending || !pending.length) {
      console.log(colors.grey(`No migrations found between the current state and ${end}`));
      return false;
    }
    console.log(colors.grey(`${pending.length} migrations found between the current state and ${end}`));
    pending.forEach(v => console.log(colors.grey(`- ${v}`)));
    console.log();
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
    console.log();
    this.emit('up', executed);
  });
}
