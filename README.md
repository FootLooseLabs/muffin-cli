# muffin-cli

Command-line interface for the [muffin framework](https://github.com/FootLooseLabs/element). Browse, search, and add components from [muffin-components](https://github.com/FootLooseLabs/muffin-components) — and scaffold full-page templates from [muffin-templates](https://github.com/FootLooseLabs/muffin-templates) — directly into your project.

## Install

```sh
npm install -g github:FootLooseLabs/muffin-cli
```

**Verify:**

```sh
muf --version
```

## Quick Reference

| Command | What it does |
|---------|-------------|
| `muf list` | List all available components |
| `muf list --templates` | List all available templates |
| `muf search <query>` | Search components by name or description |
| `muf search --templates <query>` | Search templates |
| `muf info <component>` | Show manifest, attributes, and usage examples |
| `muf add <component>` | Copy a component into your project |
| `muf init <template>` | Scaffold a template into your project |

## Commands

### `muf list`

List all components available in the registry.

```sh
muf list
```

### `muf search <query>`

Search components by name or description.

```sh
muf search editor
muf search dialog
```

### `muf info <component>`

Show the full manifest for a component — attributes, PostOffice interfaces, usage examples.

```sh
muf info json-editor
muf info confirm-dialog
```

### `muf add <component>`

Copy a component from the registry into your project. Defaults to `./src/components`.

```sh
muf add json-editor
muf add confirm-dialog --dir ./src/components/utils
```

The component source is copied directly into your project — you own it and can modify it freely. To update to a newer version, just run `muf add` again.

## How it works

`muf` reads from two public registries — both are GitHub repos with a `registry.json` manifest index:

- **[muffin-components](https://github.com/FootLooseLabs/muffin-components)** — single-file UI components, copied into your project with `muf add`
- **[muffin-templates](https://github.com/FootLooseLabs/muffin-templates)** — full-page scaffolds, copied into your project with `muf init`

No package manager, no build step. Source is copied directly into your project — you own it and can modify it freely.

## Contributing

- **Component** — open a PR on [muffin-components](https://github.com/FootLooseLabs/muffin-components). See the [contributing guide](https://github.com/FootLooseLabs/muffin-components/blob/main/CONTRIBUTING.md).
- **Template** — open a PR on [muffin-templates](https://github.com/FootLooseLabs/muffin-templates). See the [contributing guide](https://github.com/FootLooseLabs/muffin-templates/blob/main/CONTRIBUTING.md).
