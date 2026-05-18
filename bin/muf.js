#!/usr/bin/env node
import { program } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

import { listCommand } from '../src/commands/list.js';
import { searchCommand } from '../src/commands/search.js';
import { infoCommand } from '../src/commands/info.js';
import { addCommand } from '../src/commands/add.js';
import { initCommand } from '../src/commands/init.js';
import { servicesListCommand, servicesSearchCommand, servicesAddCommand } from '../src/commands/services.js';

program
    .name('muf')
    .description('muffin component, template, and services registry CLI')
    .version(version);

// ── muf components ────────────────────────────────────────────────────────────

const components = program
    .command('components')
    .description('browse and add components from the registry');

components
    .command('list')
    .description('list all available components')
    .action((_, cmd) => listCommand({ templates: false }));

components
    .command('search <query>')
    .description('search components by name, description, or tag')
    .action((query) => searchCommand(query, { templates: false }));

components
    .command('info <name>')
    .description('show manifest, attributes, and usage for a component')
    .action(infoCommand);

components
    .command('add <name>')
    .description('copy a component into your project')
    .option('-d, --dir <directory>', 'target directory', './src/components')
    .action(addCommand);

// ── muf templates ─────────────────────────────────────────────────────────────

const templates = program
    .command('templates')
    .description('browse and scaffold templates from the registry');

templates
    .command('list')
    .description('list all available templates')
    .action((_, cmd) => listCommand({ templates: true }));

templates
    .command('search <query>')
    .description('search templates by name, description, or tag')
    .action((query) => searchCommand(query, { templates: true }));

templates
    .command('init <name>')
    .description('scaffold a template into your project')
    .option('-d, --dir <directory>', 'target directory', './src')
    .action(initCommand);

// ── muf services ──────────────────────────────────────────────────────────────

const services = program
    .command('services')
    .description('browse and add org services from a private registry');

services
    .command('list')
    .description('list available services')
    .option('-s, --search <query>', 'filter by name, description, or tag')
    .action(servicesListCommand);

services
    .command('search <query>')
    .description('search services by name, description, or tag')
    .action(servicesSearchCommand);

services
    .command('add <name>')
    .description('copy a service into your project (ts → src/muffin-services, vanilla → src/web-services)')
    .option('-d, --dir <directory>', 'target directory (overrides stack default)')
    .action(servicesAddCommand);

program.parse();
