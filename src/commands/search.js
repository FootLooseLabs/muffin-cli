import chalk from 'chalk';
import { searchComponents, searchTemplates } from '../registry.js';

export async function searchCommand(query, options) {
    try {
        if (options.templates) {
            const results = await searchTemplates(query);

            if (results.length === 0) {
                console.log(chalk.yellow(`No templates found matching "${query}".`));
                return;
            }

            console.log(chalk.bold(`\n${results.length} template(s) for "${query}":\n`));

            for (const t of results) {
                console.log(`  ${chalk.green(t.name)}  ${chalk.dim(t.description || '')}`);
            }
        } else {
            const results = await searchComponents(query);

            if (results.length === 0) {
                console.log(chalk.yellow(`No components found matching "${query}".`));
                return;
            }

            console.log(chalk.bold(`\n${results.length} component(s) for "${query}":\n`));

            for (const c of results) {
                console.log(`  ${chalk.green(c.domElName)}  ${chalk.dim(c.description || '')}`);
            }
        }

        console.log('');
    } catch (e) {
        console.error(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
