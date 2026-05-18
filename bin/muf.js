#!/usr/bin/env node
import { program } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

import { searchCommand } from '../src/commands/search.js';
import { infoCommand } from '../src/commands/info.js';
import { listCommand } from '../src/commands/list.js';
import { addCommand } from '../src/commands/add.js';

program
    .name('muf')
    .description('muffin component registry CLI')
    .version(version);

program
    .command('search <query>')
    .description('search for components in the registry')
    .action(searchCommand);

program
    .command('info <component>')
    .description('show manifest for a component')
    .action(infoCommand);

program
    .command('list')
    .description('list all available components')
    .action(listCommand);

program
    .command('add <component>')
    .description('add a component to your project')
    .option('-d, --dir <directory>', 'target directory', './src/components')
    .action(addCommand);

program.parse();
