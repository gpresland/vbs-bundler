# VBScript Bundler

A VBScript bundler.

## Usage

```bash
Options:
  -V, --version      output the version number
  --entry <entry>    entry point directory of source vbs files
  --output <output>  bundled file output path
  --watch            watch files for changes
  -h, --help         output usage information
```

Files prefixed with `^` are appended to the **beginning** of the bunle.

Files prefiles with `$` are appended to the **end** of the bundle.

Files ending in `.Spec.vbs` and `.Test.vbs` are excluded from the bundle.
