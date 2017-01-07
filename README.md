# termigrator-cli
a CLI tool for [termigrator](https://github.com/cludden/termigrator) migration apps.



## Installing
```bash
npm install --save termigrator termigrator-cli
```



## Getting Started
- create a cli

```javascript
// in ./lib/cli
import Cli from 'termigrator-cli'

import migrator from './path/to/migrator'
import pkg from '../package.json'

export default new Cli({
  version: pkg.version,
  migrator,
  initialize() {
    // do any initializing tasks here (connect to db, check tables, etc)
    return Promise.resolve()
  }
})
```

- create bin file in `./bin/your-app-name`

```javascript
#!/usr/local/env node

var cli = require('../dist/cli')
cli.start()
```



## Configuration
if the migrator instance requires some configuration, use `createMigrator` instead of passing in a migrator instance
```javascript
import Cli from 'termigrator-cli'

import migrator from './path/to/migrator'
import pkg from '../package.json'

export default new Cli({
  version: pkg.version,
  createMigrator() {

  }
})
```



## CLI
Basic usage
```bash
$ your-app-name --help
```

### current
```bash
$ your-app-name current
```
List the last executed migration

---

### down
```bash
$ your-app-name down
```
Run migrations in the *down* direction

###### Options
| name | description |
| --- | --- |
| -t, --to | the exclusive lower limit on the migrations to execute |

---

### exec
```bash
$ your-app-name exec <id> <method>
```
Execute a single migration method

###### Options
| name | description |
| --- | --- |
| -s, --silent | skip logging of migration events |

---

### goto
```bash
$ your-app-name goto <id>
```
go from the current state to the specified state (in either direction)

---

### pending
```bash
$ your-app-name pending
```
List all pending migrations for the current environment

---

### up
```bash
$ your-app-name up
```
Run pending migrations in the *up* direction

###### Options
| name | description |
| --- | --- |
| -t, --to | the inclusive upper limit on the migrations to execute |

---



## Testing
run the test suite

```bash
npm test
```

run coverage

```bash
npm run coverage
```



## Contributing
1. [Fork it](https://github.com/cludden/termigrator-cli/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request



## License
Copyright (c) 2016 Chris Ludden.
Licensed under the [MIT license](LICENSE.md).
