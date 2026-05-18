// Registry source — points to registry.json in the muffin-components repo
const REGISTRY_URL = 'https://raw.githubusercontent.com/FootLooseLabs/muffin-components/main/registry.json';

let _cache = null;

export async function fetchRegistry() {
    if (_cache) return _cache;

    const res = await fetch(REGISTRY_URL);
    if (!res.ok) throw new Error(`Failed to fetch registry: ${res.status}`);

    _cache = await res.json();
    return _cache;
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
            manifest.description?.toLowerCase().includes(q)
        )
        .map(([name, manifest]) => ({ name, ...manifest }));
}

export async function allComponents() {
    const registry = await fetchRegistry();
    return Object.entries(registry.components)
        .map(([name, manifest]) => ({ name, ...manifest }));
}
