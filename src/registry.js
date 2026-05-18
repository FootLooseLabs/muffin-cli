import { getPrivateComponentRegistries, getPrivateTemplateRegistries } from './config.js';

const COMPONENTS_REGISTRY_URL = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-components/main/registry.json';
const TEMPLATES_REGISTRY_URL  = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-templates/main/registry.json';

let _componentsCache = null;
let _templatesCache  = null;

async function fetchJson(url, token) {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
}

// ── Components ────────────────────────────────────────────────────────────────

export async function fetchRegistry() {
    if (_componentsCache) return _componentsCache;

    const token = process.env.GITHUB_TOKEN;
    const base = await fetchJson(COMPONENTS_REGISTRY_URL, token);

    // merge private registries — private entry wins on name collision
    const privateUrls = getPrivateComponentRegistries();
    for (const url of privateUrls) {
        try {
            const priv = await fetchJson(url, token);
            Object.assign(base.components, priv.components ?? {});
        } catch {
            // skip unreachable private registries silently
        }
    }

    _componentsCache = base;
    return _componentsCache;
}

export async function findComponent(name) {
    const registry = await fetchRegistry();
    return registry.components[name] || null;
}

export async function searchComponents(query) {
    const registry = await fetchRegistry();
    const q = query.toLowerCase();
    return Object.entries(registry.components)
        .filter(([name, manifest]) =>
            name.includes(q) ||
            manifest.domElName?.includes(q) ||
            manifest.description?.toLowerCase().includes(q) ||
            manifest.tags?.some(t => t.toLowerCase().includes(q))
        )
        .map(([name, manifest]) => ({ name, ...manifest }));
}

export async function allComponents() {
    const registry = await fetchRegistry();
    return Object.entries(registry.components)
        .map(([name, manifest]) => ({ name, ...manifest }));
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function fetchTemplatesRegistry() {
    if (_templatesCache) return _templatesCache;

    const token = process.env.GITHUB_TOKEN;
    const base = await fetchJson(TEMPLATES_REGISTRY_URL, token);

    const privateUrls = getPrivateTemplateRegistries();
    for (const url of privateUrls) {
        try {
            const priv = await fetchJson(url, token);
            Object.assign(base.templates, priv.templates ?? {});
        } catch {
            // skip unreachable private registries silently
        }
    }

    _templatesCache = base;
    return _templatesCache;
}

export async function findTemplate(name) {
    const registry = await fetchTemplatesRegistry();
    return registry.templates[name] || null;
}

export async function searchTemplates(query) {
    const registry = await fetchTemplatesRegistry();
    const q = query.toLowerCase();
    return Object.entries(registry.templates)
        .filter(([name, manifest]) =>
            name.includes(q) ||
            manifest.description?.toLowerCase().includes(q) ||
            manifest.tags?.some(t => t.toLowerCase().includes(q))
        )
        .map(([name, manifest]) => ({ name, ...manifest }));
}

export async function allTemplates() {
    const registry = await fetchTemplatesRegistry();
    return Object.entries(registry.templates)
        .map(([name, manifest]) => ({ name, ...manifest }));
}
