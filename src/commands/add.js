import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { findComponent } from '../registry.js';

const COMPONENTS_BASE_URL = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-components/main/ui';

export async function addCommand(name, options) {
    const spinner = ora(`Fetching ${name}...`).start();

    try {
        const manifest = await findComponent(name);

        if (!manifest) {
            spinner.fail(chalk.yellow(`Component "${name}" not found in registry.`));
            process.exit(1);
        }

        const targetDir = path.resolve(options.dir);
        fs.mkdirSync(targetDir, { recursive: true });

        // Fetch component source from muffin-components repo
        const srcUrl = `${COMPONENTS_BASE_URL}/${name}/index.js`;
        const res = await fetch(srcUrl);

        if (!res.ok) {
            spinner.fail(`Failed to fetch component source: ${res.status}`);
            process.exit(1);
        }

        const source = await res.text();
        const destPath = path.join(targetDir, `${manifest.domElName}.js`);
        fs.writeFileSync(destPath, source, 'utf8');

        spinner.succeed(`Added ${chalk.green(`<${manifest.domElName}>`)} → ${chalk.dim(destPath)}`);

        if (manifest.usage?.length) {
            console.log(`\n  ${chalk.bold('usage:')}`);
            console.log(`  ${chalk.cyan(manifest.usage[0].code)}\n`);
        }

    } catch (e) {
        spinner.fail(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
