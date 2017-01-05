import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

const prompt = endpoint => `Are you sure you want to rollback to ${endpoint}`;

/**
 * Run down migrations
 * @param  {Object} args
 * @param  {Object} args.migrator
 * @param  {Object} [args.options={}] - options
 * @return {Function} command
 * @this {Cli} cli
 */
export default function down(options) {
  if (!options.to) {
    throw new Error('Missing required option "to"');
  }
  return this.migrator.getLastExecuted()
  .then((last) => {
    if (last === undefined) {
      return false;
    }
    let endpoint = options.to;
    if (/^beginning$/gi.test(options.to)) {
      endpoint = 'the beginning';
      delete options.to;
    }
    const msg = prompt(endpoint);
    console.log();
    console.log(colors.grey(`The last executed migration was ${last}`));
    return Bluebird.fromCallback(done => promptly.confirm(msg, { retry: true }, done));
  })
  .then((confirmed) => {
    if (confirmed === false) {
      return [];
    }
    return this.migrator.down(options);
  })
  .then((executed) => {
    console.log();
    this.emit('down', executed);
  });
}
