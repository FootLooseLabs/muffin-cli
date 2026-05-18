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
| `muf components list` | List all available components |
| `muf components search <query>` | Search components by name, description, or tag |
| `muf components info <name>` | Show manifest, attributes, and usage examples |
| `muf components add <name>` | Copy a component into your project |
| `muf templates list` | List all available templates |
| `muf templates search <query>` | Search templates |
| `muf templates init <name>` | Scaffold a template into your project |
| `muf services list` | List org services from a private registry |
| `muf services search <query>` | Search org services |
| `muf services add <name>` | Copy a service into your project |

## Commands

### `muf components list`

```sh
muf components list
```

### `muf components search <query>`

```sh
muf components search editor
muf components search dialog
```

### `muf components info <name>`

Show the full manifest for a component — attributes, PostOffice interfaces, usage examples.

```sh
muf components info json-editor
muf components info confirm-dialog
```

### `muf components add <name>`

Copy a component from the registry into your project. Defaults to `./src/components`.

```sh
muf components add json-editor
muf components add confirm-dialog --dir ./src/components/utils
```

Source is copied directly into your project — you own it. Run again to update to a newer version.

### `muf templates list`

```sh
muf templates list
```

### `muf templates search <query>`

```sh
muf templates search landing
```

### `muf templates init <name>`

Scaffold a full-page template into your project. Defaults to `./src`.

```sh
muf templates init saas-landing-page
muf templates init dark-media-landing-page --dir ./src/pages
```

### `muf services list`

List org services from your configured private services registry.

```sh
muf services list
muf services list --search upload
```

### `muf services search <query>`

```sh
muf services search brand
muf services search upload
```

### `muf services add <name>`

Copy a service into your project. TS services go to `src/muffin-services/`, vanilla to `src/web-services/`.

```sh
muf services add AccountManagementService
muf services add account-management --dir ./src/services
```

Run again to update to the latest version.

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

- **[muffin-components](https://github.com/FootLooseLabs/muffin-components)** — single-file UI components, copied into your project with `muf components add`
- **[muffin-templates](https://github.com/FootLooseLabs/muffin-templates)** — full-page scaffolds, copied into your project with `muf templates init`
- **Private services registry** — service files copied into your project with `muf services add`

No package manager, no build step. Source is copied directly into your project — you own it and can modify it freely.

## Contributing

- **Component** — open a PR on [muffin-components](https://github.com/FootLooseLabs/muffin-components). See the [contributing guide](https://github.com/FootLooseLabs/muffin-components/blob/main/CONTRIBUTING.md).
- **Template** — open a PR on [muffin-templates](https://github.com/FootLooseLabs/muffin-templates). See the [contributing guide](https://github.com/FootLooseLabs/muffin-templates/blob/main/CONTRIBUTING.md).
