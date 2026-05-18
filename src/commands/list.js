import chalk from 'chalk';
import { allComponents } from '../registry.js';

export async function listCommand() {
    try {
        const components = await allComponents();

        if (components.length === 0) {
            console.log(chalk.yellow('No components found in registry.'));
            return;
        }

        console.log(chalk.bold(`\n${components.length} components available:\n`));

        for (const c of components) {
            console.log(`  ${chalk.green(c.domElName)}  ${chalk.dim(c.description || '')}`);
        }

        console.log('');
    } catch (e) {
        console.error(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
