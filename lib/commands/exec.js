import Bluebird from 'bluebird';
import promptly from 'promptly';

/**
 * Execute a single migration
 * @param  {Object} args
 * @param  {Object} args.migrator
 * @param  {Object} [args.options={}]
 * @return {Bluebird} bluebird
 */
export default function exec({ migrator, options = {} }, id, direction) {
  const prompt = `Are you sure you want to execute migration ${id} ${direction}`;
  console.log();
  return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done))
  .then((confirmed) => {
    console.log();
    if (confirmed === false) {
      return undefined;
    }
    const log = Object.prototype.hasOwnProperty.call(options, 'silent');
    return migrator.execute(id, direction, { log });
  });
}
