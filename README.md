# muffin-cli

Command-line interface for the [muffin framework](https://github.com/FootLooseLabs/element). Browse, search, and add components from [muffin-components](https://github.com/FootLooseLabs/muffin-components), scaffold full-page templates from [muffin-templates](https://github.com/FootLooseLabs/muffin-templates), and manage org services from a private services registry — all from the terminal.

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
| `muf services list` | List org services from a private registry |
| `muf services search <query>` | Search org services |
| `muf services add <name>` | Set up alias and show import for a service |

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

### `muf init <template>`

Scaffold a full-page template into your project. Defaults to `./src`.

```sh
muf init saas-landing-page
muf init dark-media-landing-page --dir ./src/pages
```

### `muf services list`

List org services from your configured private services registry.

```sh
muf services list
muf services list --search upload
```

### `muf services search <query>`

Search org services by name, description, or tag.

```sh
muf services search brand
muf services search upload
```

### `muf services add <name>`

Checks your project for the required vite alias and tsconfig paths — prints what to add if missing — then prints the import line ready to use.

```sh
muf services add AccountManagementService
muf services add FileUploaderService
```

## Private registries — `.mufrc.json`

`muf` supports private org registries for components, templates, and services via a `.mufrc.json` file placed in your project root (or any ancestor directory).

```json
{
  "registries": {
    "components": [
      "https://raw.githubusercontent.com/your-org/your-components-registry/main/registry.json"
    ],
    "templates": [
      "https://raw.githubusercontent.com/your-org/your-templates-registry/main/registry.json"
    ],
    "services": [
      {
        "url": "https://raw.githubusercontent.com/your-org/your-services-registry/main/packages/services-ts/registry.json",
        "stack": "ts"
      },
      {
        "url": "https://raw.githubusercontent.com/your-org/your-services-registry/main/packages/services-vanilla/registry.json",
        "stack": "vanilla"
      }
    ]
  }
}
```

Private entries are merged with the public registry — private wins on name collision. For private GitHub repos, set `GITHUB_TOKEN` in your environment and it will be used automatically.

## How it works

`muf` reads from public registries by default — both are GitHub repos with a `registry.json` manifest index:

- **[muffin-components](https://github.com/FootLooseLabs/muffin-components)** — single-file UI components, copied into your project with `muf add`
- **[muffin-templates](https://github.com/FootLooseLabs/muffin-templates)** — full-page scaffolds, copied into your project with `muf init`

Services work differently: they live in a shared private repo, referenced via a vite path alias. `muf services add` wires the alias and shows the import — nothing is copied.

No package manager, no build step for components and templates. Source is copied directly into your project — you own it and can modify it freely.

## Contributing

- **Component** — open a PR on [muffin-components](https://github.com/FootLooseLabs/muffin-components). See the [contributing guide](https://github.com/FootLooseLabs/muffin-components/blob/main/CONTRIBUTING.md).
- **Template** — open a PR on [muffin-templates](https://github.com/FootLooseLabs/muffin-templates). See the [contributing guide](https://github.com/FootLooseLabs/muffin-templates/blob/main/CONTRIBUTING.md).
