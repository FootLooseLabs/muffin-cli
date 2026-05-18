import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { getServicesRegistries } from '../config.js';

const DEFAULT_DIRS = {
    ts:      './src/muffin-services',
    vanilla: './src/web-services',
};

async function fetchJson(url, token) {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
}

async function fetchText(url, token) {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch source (${res.status}): ${url}`);
    return res.text();
}

function baseUrl(registryUrl) {
    // strip /registry.json to get the directory base
    return registryUrl.replace(/\/registry\.json$/, '');
}

async function fetchServicesRegistry(entry) {
    const token = entry.token ?? process.env.GITHUB_TOKEN;
    const data = await fetchJson(entry.url, token);
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
          "stack": "ts"
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

export async function servicesAddCommand(name, options) {
    const spinner = ora(`Fetching ${name}...`).start();
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

        const token = foundEntry.token ?? process.env.GITHUB_TOKEN;
        const stack = found.stack ?? foundEntry.stack ?? 'ts';

        // derive filename: registry entry may have explicit `file`, otherwise infer
        const filename = found.file ?? (stack === 'ts' ? `${name}.ts` : `${name}.js`);
        const srcUrl = `${baseUrl(foundEntry.url)}/${filename}`;
        const source = await fetchText(srcUrl, token);

        // resolve target directory
        const defaultDir = DEFAULT_DIRS[stack] ?? './src/muffin-services';
        const targetDir = path.resolve(options.dir ?? defaultDir);
        fs.mkdirSync(targetDir, { recursive: true });

        const destPath = path.join(targetDir, filename);
        fs.writeFileSync(destPath, source, 'utf8');

        spinner.succeed(`Added ${chalk.green(name)} → ${chalk.dim(destPath)}`);

        // print import line relative to a typical src/ entry point
        const relImport = `./${path.relative(path.resolve('./src'), destPath).replace(/\\/g, '/')}`;
        console.log(`\n  ${chalk.bold('import:')}`);
        console.log(`  ${chalk.cyan(`import ${name} from '${relImport}'`)}\n`);

    } catch (e) {
        spinner.fail(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
