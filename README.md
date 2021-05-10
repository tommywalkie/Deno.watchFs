# Deno.watchFs

The hereby repo strives to document the behavior of `Deno.watchFs` (which is based on Rust crate `notify`) step-by-step on different systems.

Feel free to use it as reference when designing tools which rely on file watching.

## Notes

I've been using [The Event Guide](https://github.com/notify-rs/notify/wiki/The-Event-Guide#platform-specific-behaviour) from `notify` wiki, but here a few notes from my tests:

- Obviously, path format in `event.paths` depends of the OS (slashes, antislashes, etc.) 
- From CI logs, MacOS filesystem operations are _way slower_. the first `mkdir` command may not be completed before  `Deno.watchFs` is being used, _i.e._ this is why it may first emit a `create` event for the watched source.
- On Windows, `modify` events can be both content and metadata changes (file size included), you may need to periodically de-duplicate `modify` events.
- Linux is the only OS granted with `access` events and `modify` events including two paths.
- If your use case is tracking files, consider using `walkSync` to retrieve existing entries when running `Deno.watchFs`, then when new folders gets added or when some `modify` event happens with a folder (this can be either renames or removals), because folder items' events won't happen.

## Testing

Clone the hereby repo and launch tests with Deno:

```sh
deno test -A --unstable
```

## Behaviors

### Adding a new file

This is the equivalent of creating a file entry and saving new content (`echo "Hello world" > A.txt`). 

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
```

**Result:**

```js
[
  /* All platforms */
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

Note that, on MacOS, file edits are preceded by a `create` event for some reason.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
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
  /* Only on MacOS */
  {
    kind: "create",
    paths: [ "/Users/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/jejw8egqf/A.txt" ]
  },
  /* All platforms */
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

### Adding a new folder

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join(path, 'foo'), { recursive: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/7ml0dad18/foo" ]
  }
]
```

### Copy a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
Deno.copyFileSync(join(path, 'A.txt'), join(path, 'B.txt'))
```

**Result:**

```js
[
  /* All platforms */
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
  /* All platforms */
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

### Copy a folder

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'
import { copySync } from 'https://deno.land/std@0.95.0/fs/mod.ts'

/* Folder 'foo' already exists... */
copySync(join(path, 'foo'), join(path, 'bar'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/bar" ]
  }
]
```

### Move a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'
import { moveSync } from 'https://deno.land/std@0.95.0/fs/mod.ts'

moveSync(join(path, 'A.txt'), join(path, 'foo/A.txt'), { overwrite: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/i3h6cswpt/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/i3h6cswpt/foo/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/i3h6cswpt/A.txt",
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/i3h6cswpt/foo/A.txt"
    ]
  }
]
```

### Move a folder

If the folder came from outside the watching scope, folder items will also emit events like if they were created.

```js
Deno.mkdirSync(join(path, 'foo'), { recursive: true })
moveSync(join(path, 'foo'), join(path, 'bar/foo/'), { overwrite: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/k5nl2tstq/foo" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/k5nl2tstq/bar/foo" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/k5nl2tstq/foo",
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/k5nl2tstq/bar/foo"
    ]
  }
]
```

### Rename a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
Deno.renameSync(join(path, 'A.txt'), join(path, 'B.txt'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/omi3xk5p4/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/omi3xk5p4/B.txt" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/omi3xk5p4/A.txt",
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/omi3xk5p4/B.txt"
    ]
  }
]
```

### Rename a folder

Note that only the folder will emit events, while folder items won't.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join(path, 'foo'), { recursive: true })
Deno.renameSync(join(path, 'foo'), join(path, 'bar'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/1k8v51qih/foo" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/1k8v51qih/bar" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/1k8v51qih/foo",
      "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/1k8v51qih/bar"
    ]
  }
]
```