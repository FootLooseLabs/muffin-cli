import chalk from 'chalk';
import { allComponents, allTemplates } from '../registry.js';

export async function listCommand(options) {
    try {
        if (options.templates) {
            const templates = await allTemplates();

            if (templates.length === 0) {
                console.log(chalk.yellow('No templates found in registry.'));
                return;
            }

            console.log(chalk.bold(`\n${templates.length} template(s) available:\n`));

            for (const t of templates) {
                console.log(`  ${chalk.green(t.name)}  ${chalk.dim(t.description || '')}`);
            }
        } else {
            const components = await allComponents();

            if (components.length === 0) {
                console.log(chalk.yellow('No components found in registry.'));
                return;
            }

            console.log(chalk.bold(`\n${components.length} component(s) available:\n`));

            for (const c of components) {
                console.log(`  ${chalk.green(c.domElName)}  ${chalk.dim(c.description || '')}`);
            }
        }

        console.log('');
    } catch (e) {
        console.error(chalk.red(`Error: ${e.message}`));
        process.exit(1);
    }
}
