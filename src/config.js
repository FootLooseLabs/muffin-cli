import fs from 'fs';
import path from 'path';

/**
 * Walk up from cwd looking for .mufrc.json
 */
function findConfig() {
    let dir = process.cwd();
    while (true) {
        const candidate = path.join(dir, '.mufrc.json');
        if (fs.existsSync(candidate)) {
            try {
                return JSON.parse(fs.readFileSync(candidate, 'utf8'));
            } catch {
                return {};
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return {};
}

let _config = null;

export function loadConfig() {
    if (!_config) _config = findConfig();
    return _config;
}

/**
 * Returns extra component registry URLs defined in .mufrc.json
 */
export function getPrivateComponentRegistries() {
    const cfg = loadConfig();
    return cfg.registries?.components ?? [];
}

/**
 * Returns extra template registry URLs defined in .mufrc.json
 */
export function getPrivateTemplateRegistries() {
    const cfg = loadConfig();
    return cfg.registries?.templates ?? [];
}

/**
 * Returns services registry config from .mufrc.json
 * Expected shape:
 *   { url, stack, alias, token? }
 */
export function getServicesRegistries() {
    const cfg = loadConfig();
    const raw = cfg.registries?.services ?? [];
    return Array.isArray(raw) ? raw : [raw];
}
