# Deno.watchFs

The hereby repo strives to document the behavior of `Deno.watchFs` (which is based on Rust crate `notify`) step-by-step on different systems.

Feel free to use it as reference when designing tools which rely on file watching.

## Notes

I've been using [The Event Guide](https://github.com/notify-rs/notify/wiki/The-Event-Guide#platform-specific-behaviour) from `notify` wiki, but here a few notes from my tests:

- Obviously, path format in `event.paths` depends of the OS (slashes, antislashes, etc.) 
- From CI logs, MacOS filesystem operations are _way slower_. the first `mkdir` command may not be completed before  `Deno.watchFs` is being used, _i.e._ this is why it may first emit a `create` event for the watched source.
- On Windows, `modify` events can be both content and metadata changes (file size included), you may need to periodically de-duplicate `modify` events.
- Linux is the only OS granted with `access` events and `modify` events for renamed entries (including two paths).
- If your use case is tracking files, consider using `walkSync` to retrieve existing entries when running `Deno.watchFs`, then when new folders gets added or when some `modify` event happens with a folder (this can be either renames or removals), because folder items' events won't happen.

## Behaviors

### Adding a new file

This is the equivalent of creating a file entry (`touch file.txt`) and then adding the content. 

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join(/* some path */, '/A.txt'), 'Hello world')
```

**Result:**

```js
[
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/j3dset8ut/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/j3dset8ut/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/j3dset8ut/A.txt" ]
  }
]
```

### Editing a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

/* A.txt already exists... */
Deno.writeTextFileSync(join(/* some path */, 'A.txt'), 'Hello world')
```

**Result:**

```js
[
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  }
]
```

### Adding a new empty folder

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join(/* some path */, 'foo'), { recursive: true })
```

**Result:**

```js
[
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  }
]
```

### Copy a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

/* A.txt already exists... */
Deno.copyFileSync(join(/* some path */, 'A.txt'), join(/* some path */, 'B.txt'))
```

**Result:**

```js
[
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/B.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/B.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/B.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/B.txt" ]
  }
]
```

### Copy an empty folder

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'
import { copySync } from 'https://deno.land/std@0.95.0/fs/mod.ts'

/* Folder 'foo' already exists... */
copySync(join(/* some path */, 'foo'), join(/* some path */, 'bar'))
```

**Result:**

```js
[
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  }
]
```

### Copy a non-empty folder

```js
Deno.writeTextFileSync(join(path, 'A.txt'), 'Foo bar')
Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
```

**Result:**

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```

### Move a file

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```

### Move an empty folder

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```

### Move a non-empty folder

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```

### Rename a file

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```

### Rename an empty folder

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```

### Rename a non-empty folder

```js
/* TODO */
```

**Result:**

```js
/* TODO */
```