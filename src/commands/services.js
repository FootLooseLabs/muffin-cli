import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { getServicesRegistries } from '../config.js';

async function fetchServicesRegistry(entry) {
    const token = entry.token ?? process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization: `token ${token}` } : {};
    const res = await fetch(entry.url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch services registry: ${res.status}`);
    const data = await res.json();
    return { ...data, _entry: entry };
}

async function loadAllServicesRegistries() {
    const registries = getServicesRegistries();
    if (registries.length === 0) {
        console.error(chalk.red('No services registry configured. Add one to .mufrc.json:'));
        console.error(chalk.dim(`
  {
    "registries": {
      "services": [
        {
          "url": "https://raw.githubusercontent.com/your-org/your-services/main/packages/services-ts/registry.json",
          "stack": "ts",
          "alias": "@hais-services",
          "path": "../../your-services/packages/services-ts"
        }
      ]
    }
  }
`));
        process.exit(1);
    }

    const results = [];
    for (const entry of registries) {
        const data = await fetchServicesRegistry(entry);
        results.push(data);
    }
    return results;
}

// ── list ──────────────────────────────────────────────────────────────────────

export async function servicesListCommand(options) {
    const spinner = ora('Fetching services registry...').start();
    try {
        const registries = await loadAllServicesRegistries();
        spinner.stop();

        for (const reg of registries) {
            const entries = Object.entries(reg.services ?? {});
            const stackLabel = reg._entry.stack ? chalk.dim(`[${reg._entry.stack}]`) : '';

            if (entries.length === 0) {
                console.log(chalk.yellow('No services found in registry.'));
                continue;
            }

            const query = options.search?.toLowerCase();
            const filtered = query
                ? entries.filter(([name, s]) =>
                    name.toLowerCase().includes(query) ||
                    s.description?.toLowerCase().includes(query) ||
                    s.tags?.some(t => t.includes(query))
                  )
                : entries;

            console.log(chalk.bold(`\n${filtered.length} service(s) available ${stackLabel}:\n`));

            for (const [name, svc] of filtered) {
                console.log(`  ${chalk.green(name)}  ${chalk.dim(svc.description || '')}`);
            }
        }

        console.log('');
    } catch (e) {
        spinner.fail(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}

// ── search ────────────────────────────────────────────────────────────────────

export async function servicesSearchCommand(query) {
    const spinner = ora(`Searching services for "${query}"...`).start();
    try {
        const registries = await loadAllServicesRegistries();
        spinner.stop();

        const q = query.toLowerCase();
        let total = 0;

        for (const reg of registries) {
            const matches = Object.entries(reg.services ?? {})
                .filter(([name, s]) =>
                    name.toLowerCase().includes(q) ||
                    s.description?.toLowerCase().includes(q) ||
                    s.tags?.some(t => t.includes(q))
                );

            if (matches.length === 0) continue;
            total += matches.length;

            const stackLabel = reg._entry.stack ? chalk.dim(`[${reg._entry.stack}]`) : '';
            console.log(chalk.bold(`\n${matches.length} match(es) ${stackLabel}:\n`));

            for (const [name, svc] of matches) {
                console.log(`  ${chalk.green(name)}  ${chalk.dim(svc.description || '')}`);
                if (svc.tags?.length) {
                    console.log(`    ${chalk.dim('tags: ' + svc.tags.join(', '))}`);
                }
            }
        }

        if (total === 0) {
            console.log(chalk.yellow(`No services found matching "${query}".`));
        }

        console.log('');
    } catch (e) {
        console.error(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}

// ── add ───────────────────────────────────────────────────────────────────────

export async function servicesAddCommand(name) {
    const spinner = ora(`Looking up ${name}...`).start();
    try {
        const registries = await loadAllServicesRegistries();

        let found = null;
        let foundEntry = null;
        for (const reg of registries) {
            if (reg.services?.[name]) {
                found = reg.services[name];
                foundEntry = reg._entry;
                break;
            }
        }

        if (!found) {
            spinner.fail(chalk.yellow(`Service "${name}" not found in any configured registry.`));
            process.exit(1);
        }

        spinner.succeed(`Found ${chalk.green(name)}`);

        // Ensure vite alias is in place
        const viteConfigPath = findViteConfig();
        if (viteConfigPath) {
            ensureViteAlias(viteConfigPath, foundEntry);
        } else {
            console.log(chalk.yellow('\n  vite.config.js not found — add the alias manually:'));
        }

        // Always print tsconfig hint for TS stack
        const isTs = foundEntry.stack === 'ts' || name.endsWith('Service');
        if (isTs) {
            ensureTsConfigPaths(foundEntry);
        }

        // Print import line
        const importPath = foundEntry.alias
            ? `${foundEntry.alias}/${name}`
            : `@hais-services/${name}`;

        console.log(`\n  ${chalk.bold('import:')}`);
        console.log(`  ${chalk.cyan(`import ${name} from '${importPath}'`)}\n`);

    } catch (e) {
        spinner.fail(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}

// ── helpers ───────────────────────────────────────────────────────────────────

function findViteConfig() {
    const names = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'];
    let dir = process.cwd();
    while (true) {
        for (const name of names) {
            const p = path.join(dir, name);
            if (fs.existsSync(p)) return p;
        }
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

function ensureViteAlias(viteConfigPath, entry) {
    const alias = entry.alias ?? '@hais-services';
    const src = fs.readFileSync(viteConfigPath, 'utf8');

    if (src.includes(alias)) {
        console.log(chalk.dim(`\n  vite alias "${alias}" already present in ${path.basename(viteConfigPath)}`));
        return;
    }

    const resolvedPath = entry.path
        ? `path.resolve(__dirname, '${entry.path}')`
        : `path.resolve(__dirname, '../../hais-services/packages/services-ts')`;

    console.log(chalk.yellow(`\n  Add this alias to ${path.basename(viteConfigPath)}:`));
    console.log(chalk.dim(`
    resolve: {
      alias: {
        '${alias}': ${resolvedPath}
      }
    }
`));
}

function ensureTsConfigPaths(entry) {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const alias = entry.alias ?? '@hais-services';

    if (fs.existsSync(tsconfigPath)) {
        const src = fs.readFileSync(tsconfigPath, 'utf8');
        if (src.includes(alias)) {
            console.log(chalk.dim(`  tsconfig paths for "${alias}" already present`));
            return;
        }
    }

    const resolvedPath = entry.path
        ? `${entry.path}/*`
        : '../../hais-services/packages/services-ts/*';

    console.log(chalk.yellow(`  Add to tsconfig.json compilerOptions.paths:`));
    console.log(chalk.dim(`
    "${alias}/*": ["${resolvedPath}"]
`));
}
