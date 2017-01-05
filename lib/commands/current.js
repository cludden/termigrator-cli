import colors from 'colors';

const initialized = last => `The last executed migration was ${last}`;
const uninitialized = 'It doesn\'t look like any migrations have been executed';

/**
 * List the last executed migration
 * @param  {Object} args
 * @param  {Object} args.migrator - migrator instance
 * @return {Bluebird} bluebird
 */
export default function current({ migrator }) {
  return migrator.getLastExecuted()
  .then((last) => {
    const msg = last === undefined ? uninitialized : initialized(last);
    console.log();
    console.log(colors.grey(msg));
    console.log();
  });
}
