import chalk from 'chalk';
import { findComponent } from '../registry.js';

export async function infoCommand(name) {
    try {
        const manifest = await findComponent(name);

        if (!manifest) {
            console.log(chalk.yellow(`Component "${name}" not found in registry.`));
            return;
        }

        console.log(chalk.bold(`\n<${manifest.domElName}>`));
        if (manifest.description) console.log(chalk.dim(manifest.description));
        console.log('');

        if (manifest.import)     console.log(`  ${chalk.dim('import')}      ${manifest.import}`);
        if (manifest.cdn)        console.log(`  ${chalk.dim('cdn')}         ${manifest.cdn}`);
        if (manifest.advertiseAs) console.log(`  ${chalk.dim('interface')}   ${manifest.advertiseAs}`);

        if (manifest.attributes && Object.keys(manifest.attributes).length) {
            console.log(`\n  ${chalk.bold('attributes')}`);
            for (const [k, v] of Object.entries(manifest.attributes)) {
                console.log(`    ${chalk.green(k)}  ${chalk.dim(v)}`);
            }
        }

        if (manifest.lexicon && Object.keys(manifest.lexicon).length) {
            console.log(`\n  ${chalk.bold('lexicon')}`);
            for (const [k, v] of Object.entries(manifest.lexicon)) {
                console.log(`    ${chalk.green(k)}  ${chalk.dim(v)}`);
            }
        }

        if (manifest.emits && Object.keys(manifest.emits).length) {
            console.log(`\n  ${chalk.bold('emits')}`);
            for (const [k, v] of Object.entries(manifest.emits)) {
                console.log(`    ${chalk.green(k)}  ${chalk.dim(v)}`);
            }
        }

        if (manifest.listens && Object.keys(manifest.listens).length) {
            console.log(`\n  ${chalk.bold('listens')}`);
            for (const [k, v] of Object.entries(manifest.listens)) {
                console.log(`    ${chalk.green(k)}  ${chalk.dim(v)}`);
            }
        }

        if (manifest.usage?.length) {
            console.log(`\n  ${chalk.bold('usage')}`);
            for (const u of manifest.usage) {
                console.log(`    ${chalk.dim(u.label)}`);
                console.log(`    ${chalk.cyan(u.code)}`);
                console.log('');
            }
        }

    } catch (e) {
        console.error(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
