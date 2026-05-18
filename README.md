# muffin-cli

Command-line interface for the [muffin framework](https://github.com/FootLooseLabs/element). Browse, search, and add components from the [muffin component registry](https://github.com/FootLooseLabs/muffin-components) directly into your project.

## Install

```sh
npm install -g @muffin/cli
```

**Verify:**

```sh
muf --version
```

## Quick Reference

| Command | What it does |
|---------|-------------|
| `muf list` | List all available components |
| `muf search <query>` | Search components by name or description |
| `muf info <component>` | Show manifest, attributes, and usage examples |
| `muf add <component>` | Copy a component into your project |

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

`muf` reads from the [muffin-components](https://github.com/FootLooseLabs/muffin-components) registry — a public GitHub repo containing component source and a `registry.json` manifest index. No package manager, no build step — components are plain JavaScript files that work directly with the muffin framework.

## Contributing a component

To add a component to the registry, open a pull request on [muffin-components](https://github.com/FootLooseLabs/muffin-components). See the [contributing guide](https://github.com/FootLooseLabs/muffin-components/blob/main/CONTRIBUTING.md) for the component structure and manifest format.
