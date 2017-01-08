import Bluebird from 'bluebird';

export function createHandler(handler) {
  return argv => Bluebird.try(() => {
    if (argv.migrator) {
      return argv.migrator;
    } else if (typeof argv.createMigrator === 'function') {
      return argv.createMigrator(argv);
    }
    return undefined;
  })
  .then((migrator) => {
    if (typeof migrator !== 'object') {
      throw new Error('migrator must be an instance of Termigrator.Migrator');
    }
    argv.migrator = migrator; // eslint-disable-line
    return handler(argv);
  });
}
