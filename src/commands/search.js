import chalk from 'chalk';
import { searchComponents } from '../registry.js';

export async function searchCommand(query) {
    try {
        const results = await searchComponents(query);

        if (results.length === 0) {
            console.log(chalk.yellow(`No components found matching "${query}".`));
            return;
        }

        console.log(chalk.bold(`\n${results.length} result(s) for "${query}":\n`));

        for (const c of results) {
            console.log(`  ${chalk.green(c.domElName)}  ${chalk.dim(c.description || '')}`);
        }

        console.log('');
    } catch (e) {
        console.error(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
