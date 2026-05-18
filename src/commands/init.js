import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { findTemplate } from '../registry.js';

const TEMPLATES_BASE_URL = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-templates/main/templates';

export async function initCommand(name, options) {
    const spinner = ora(`Fetching ${name}...`).start();

    try {
        const manifest = await findTemplate(name);

        if (!manifest) {
            spinner.fail(chalk.yellow(`Template "${name}" not found in registry.`));
            process.exit(1);
        }

        const targetDir = path.resolve(options.dir);
        fs.mkdirSync(targetDir, { recursive: true });

        spinner.text = `Scaffolding ${name}...`;

        const written = [];

        for (const file of manifest.files) {
            const srcUrl = `${TEMPLATES_BASE_URL}/${name}/${file}`;
            const res = await fetch(srcUrl);

            if (!res.ok) {
                spinner.fail(`Failed to fetch ${file}: ${res.status}`);
                process.exit(1);
            }

            const source = await res.text();
            const destPath = path.join(targetDir, file);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.writeFileSync(destPath, source, 'utf8');
            written.push(destPath);
        }

        spinner.succeed(`Scaffolded ${chalk.green(name)} into ${chalk.dim(targetDir)}`);

        console.log(`\n  ${chalk.bold('files created:')}`);
        for (const f of written) {
            console.log(`  ${chalk.dim(f)}`);
        }

        if (manifest.components?.length) {
            console.log(`\n  ${chalk.bold('run next:')}`);
            for (const c of manifest.components) {
                console.log(`  ${chalk.cyan(`muf components add ${c}`)}`);
            }
        }

        if (manifest.slots) {
            console.log(`\n  ${chalk.bold('slots to customize:')}`);
            for (const [key, hint] of Object.entries(manifest.slots)) {
                console.log(`  ${chalk.yellow(key)}  ${chalk.dim(hint)}`);
            }
        }

        console.log('');

    } catch (e) {
        spinner.fail(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
