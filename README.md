# termigrator-cli
a CLI tool (using [yargs](http://yargs.js.org/)) for [termigrator](https://github.com/cludden/termigrator) migration apps.



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
})
```

- create bin file in `./bin/your-app-name`

```javascript
#!/usr/local/env node

require('../dist/cli').start()
```

- update the file permissions to make it executable

```bash
chmod +x ./bin/your-app-name
```

- add npm bin entry to `package.json`

```json
{
  "bin": "./bin/your-app-name"
}
```



## Configuration
Both the CLI and migrator can be configured using the `configure` and `createMigrator` hooks.
```javascript
import Cli from 'termigrator-cli'

import createMigrator from './path/to/migrator'
import pkg from '../package.json'

export default new Cli({
  version: pkg.version,

  // define a #configure method that receives the yargs instance
  configure(yargs) {
    return yargs.options({
      foo: {
        alias: 'f',
        describe: 'my custom global option',
        demand: true,
        global: true,
        default: 'bar'
      }
    })
  },

  // define a #createMigrator method (instead of passing in the migrator) that
  // receives the parsed argv instance from yargs and should return a valid
  // migrator or a promise that resolves to a valid migrator
  createMigrator(argv) {
    return createMigrator(argv.foo)
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
$ your-app-name down <version>
```
Run migrations in the *down* direction

###### Options
| name | description |
| --- | --- |
| -t, --to | the exclusive lower limit on the migrations to execute |

---

### exec
```bash
$ your-app-name exec <version> <direction>
```
Execute a single migration method

###### Options
| name | description |
| --- | --- |
| -s, --silent | skip logging of migration events |

---

### goto
```bash
$ your-app-name goto <version>
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
$ your-app-name up [version]
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
