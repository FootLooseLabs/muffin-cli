const COMPONENTS_REGISTRY_URL = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-components/main/registry.json';
const TEMPLATES_REGISTRY_URL  = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-templates/main/registry.json';

let _componentsCache = null;
let _templatesCache  = null;

export async function fetchRegistry() {
    if (_componentsCache) return _componentsCache;
    const res = await fetch(COMPONENTS_REGISTRY_URL);
    if (!res.ok) throw new Error(`Failed to fetch components registry: ${res.status}`);
    _componentsCache = await res.json();
    return _componentsCache;
}

export async function fetchTemplatesRegistry() {
    if (_templatesCache) return _templatesCache;
    const res = await fetch(TEMPLATES_REGISTRY_URL);
    if (!res.ok) throw new Error(`Failed to fetch templates registry: ${res.status}`);
    _templatesCache = await res.json();
    return _templatesCache;
}

// ── Components ────────────────────────────────────────────────────────────────

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
