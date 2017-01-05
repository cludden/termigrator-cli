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
 */
export default function down({ migrator, options = {} }) {
  return migrator.getLastExecuted()
  .then((last) => {
    if (last === undefined) {
      return false;
    }
    const endpoint = /^beginning$/gi.test(options.to) ? 'the beginning' : options.to;
    const msg = prompt(endpoint);
    console.log();
    console.log(colors.grey(`The last executed migration was ${last}`));
    return Bluebird.fromCallback(done => promptly.confirm(msg, { retry: true }, done));
  })
  .then((confirmed) => {
    if (confirmed === false) {
      return undefined;
    }
    return migrator.down(options);
  })
  .then((executed) => {
    console.log();
    return executed;
  });
}
