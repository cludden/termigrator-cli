import Bluebird from 'bluebird';
import promptly from 'promptly';

/**
 * Execute a single migration
 * @param  {Object} args
 * @param  {Object} args.migrator
 * @param  {Object} [args.options={}]
 * @return {Bluebird} bluebird
 */
export default function exec(id, direction, options) {
  const prompt = `Are you sure you want to execute migration ${id} ${direction}`;
  console.log();
  return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done))
  .then((confirmed) => {
    console.log();
    if (confirmed === false) {
      return undefined;
    }
    const log = Object.prototype.hasOwnProperty.call(options, 'silent');
    return this.migrator.execute(id, direction, { log });
  })
  .then((executed) => {
    this.emit('exec', executed, executed === undefined ? undefined : direction);
  });
}
