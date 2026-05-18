#!/usr/bin/env node
import { program } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

import { searchCommand } from '../src/commands/search.js';
import { infoCommand } from '../src/commands/info.js';
import { listCommand } from '../src/commands/list.js';
import { addCommand } from '../src/commands/add.js';
import { initCommand } from '../src/commands/init.js';

program
    .name('muf')
    .description('muffin component and template registry CLI')
    .version(version);

program
    .command('list')
    .description('list all available components (or templates with --templates)')
    .option('-t, --templates', 'list templates instead of components')
    .action(listCommand);

program
    .command('search <query>')
    .description('search components (or templates with --templates)')
    .option('-t, --templates', 'search templates instead of components')
    .action(searchCommand);

program
    .command('info <component>')
    .description('show manifest for a component')
    .action(infoCommand);

program
    .command('add <component>')
    .description('add a component to your project')
    .option('-d, --dir <directory>', 'target directory', './src/components')
    .action(addCommand);

program
    .command('init <template>')
    .description('scaffold a template into your project')
    .option('-d, --dir <directory>', 'target directory', './src')
    .action(initCommand);

program.parse();
