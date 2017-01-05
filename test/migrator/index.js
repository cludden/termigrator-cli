import { Migrator } from 'termigrator';

import Store from './store';

export const migrations = ['1', '2', '3', '4', '5'];
export const store = new Store();

export default new Migrator({
  execMigration(id, direction) {
    const val = parseInt(id, 10);
    const next = direction === 'up' ? val + 1 : val - 1;
    store.version = next.toString();
    return Promise.resolve();
  },

  getLastExecuted() {
    return Promise.resolve(store.version);
  },

  getMigrations() {
    return Promise.resolve(migrations);
  },

  log() {
    return Promise.resolve();
  },
});
