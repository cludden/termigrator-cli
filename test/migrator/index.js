import { Migrator } from 'termigrator';

import Store from './store';

export const migrations = ['1', '2', '3', '4', '5'];
export const store = new Store();

export default new Migrator({
  execMigration(id, direction) {
    const next = direction === 'up' ? id : (id - 1).toString();
    store.setVersion(next === '0' ? undefined : next);
    return Promise.resolve();
  },

  getLastExecuted() {
    return Promise.resolve(store.getVersion());
  },

  getMigrations() {
    return Promise.resolve(migrations);
  },

  log() {
    return Promise.resolve();
  },
});
