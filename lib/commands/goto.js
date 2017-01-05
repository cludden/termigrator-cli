import Bluebird from 'bluebird';
import colors from 'colors';
import promptly from 'promptly';

/**
 * Generate an appropriate info statement
 * @param  {Object} args
 * @param  {String} args.direction
 * @param  {String} args.pending
 * @param  {String} args.version
 * @return {String} info
 * @private
 */
function createInfo({ direction, pending, version }) {
  if (pending.length === 0) {
    return 'No migrations found, current environment is up to date';
  }
  return `${pending.length} ${direction} migrations found in between the current version and ${version}`;
}

/**
 * Migrate to a specific state from the current state
 * @param  {Object} args
 * @param  {Object} args.migrator
 * @param  {String} version
 * @return {Bluebird} bluebird
 */
export default function goto(version) {
  return this.migrator.getGotoVersions(version)
  .spread((direction, pending) => {
    const info = createInfo({ direction, pending, version });
    console.log();
    console.log(colors.grey(info));
    return pending;
  })
  .each(id => console.log(colors.grey(`- ${id}`)))
  .then(() => {
    console.log();
    const prompt = 'Are you sure you want to migrate?';
    return Bluebird.fromCallback(done => promptly.confirm(prompt, { retry: true }, done));
  })
  .then((confirmed) => {
    if (confirmed === false) {
      return [];
    }
    return this.migrator.goto(version);
  })
  .then((executed) => {
    this.emit('goto', executed);
  });
}
