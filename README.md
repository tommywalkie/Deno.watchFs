# Deno.watchFs

The hereby repo strives to document the behavior of `Deno.watchFs` (which is based on Rust crate `notify`) step-by-step on different systems.

Feel free to use it as reference when designing tools which rely on file watching.

- [Notes](https://github.com/tommywalkie/Deno.watchFs#notes)
- [Testing](https://github.com/tommywalkie/Deno.watchFs#testing)
- [Behaviors](https://github.com/tommywalkie/Deno.watchFs#behaviors)
  - [Add a new file](https://github.com/tommywalkie/Deno.watchFs#add-a-new-file)
  - [Edit file](https://github.com/tommywalkie/Deno.watchFs#edit-a-file)
  - [Add a new folder](https://github.com/tommywalkie/Deno.watchFs#add-a-new-folder)
  - [Copy a file](https://github.com/tommywalkie/Deno.watchFs#copy-a-file)
  - [Copy a folder](https://github.com/tommywalkie/Deno.watchFs#copy-a-folder)
  - [Move a file](https://github.com/tommywalkie/Deno.watchFs#move-a-file)
  - [Move a folder](https://github.com/tommywalkie/Deno.watchFs#move-a-folder)
  - [Rename a file](https://github.com/tommywalkie/Deno.watchFs#rename-a-file)
  - [Rename a folder](https://github.com/tommywalkie/Deno.watchFs#rename-a-folder)
  - [Remove a file](https://github.com/tommywalkie/Deno.watchFs#remove-a-file)
  - [Remove a folder](https://github.com/tommywalkie/Deno.watchFs#remove-a-folder)

## Notes

I've been using [The Event Guide](https://github.com/notify-rs/notify/wiki/The-Event-Guide#platform-specific-behaviour) from `notify` wiki, but here a few notes from my tests:

- Obviously, path format in `event.paths` depends of the OS (slashes, antislashes, etc.).
- `Deno.FsEvent` doesn't provide stats so you'll' need to call `lstatSync` for each event to process `event.paths` entries.
- From CI logs, MacOS filesystem operations are _way slower_. the first `mkdir` command may not be completed before  `Deno.watchFs` is being used, _i.e._ this is why it may first emit a `create` event for the watched source.
- On Windows, `modify` events can be both content and metadata changes (file size included), you may need to periodically de-duplicate `modify` events.
- Linux is the only OS granted with `access` events and `modify` events including two paths.
- If your use case is tracking files, consider using `walkSync` to retrieve existing entries when running `Deno.watchFs`, then when new folders gets added and when some `modify` event happens with a folder (this can be either moves, renames or removals), because folder items' events won't happen.

## Testing

Clone the hereby repo and launch tests with Deno:

```sh
deno test -A --unstable
```

## Behaviors

### Add a new file

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

### Edit a file

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

### Add a new folder

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
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/e9izorrnz/A.txt" ]
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

Folder items will also emit events like if they were created into the new folder, with one additional `modify` event.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'
import { copySync } from 'https://deno.land/std@0.95.0/fs/mod.ts'

Deno.mkdirSync(join(path, 'foo'), { recursive: true })
Deno.writeTextFileSync(join(path, 'foo/A.txt'), 'Hello world')
copySync(join(path, 'foo'), join(path, 'bar'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/foo" ]
  },
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/foo/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/foo/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/A.txt" ]
  },
  /* All platforms */
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/bar" ]
  },
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/bar/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/bar/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/bar/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/nk89mg2j0/bar/A.txt" ]
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

Unlike folder copies, folder items won't emit events, so you may have to walk the new folder and register items.

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

### Remove a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
Deno.removeSync(join(path, 'A.txt'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/0c34facb9/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/0c34facb9/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/0c34facb9/A.txt" ]
  },
  /* All platforms */
  {
    kind: "remove",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/0c34facb9/A.txt" ]
  }
]
```

### Remove a folder

Folder items gets removed first and emit `remove` events, then the folder gets removed and emits a `remove` event.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join(path, 'foo'), { recursive: true })
Deno.writeTextFileSync(join(path, 'foo/A.txt'), 'Hello world')
Deno.removeSync(join(path, 'foo'), { recursive: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/wqaw5fl3l/foo" ]
  },
  {
    kind: "modify",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/wqaw5fl3l/foo/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/wqaw5fl3l/foo/A.txt" ]
  },
  /* All platforms */
  {
    kind: "remove",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/wqaw5fl3l/foo/A.txt" ]
  },
  {
    kind: "remove",
    paths: [ "/home/runner/work/Deno.watchFs/Deno.watchFs/__TEST__/wqaw5fl3l/foo" ]
  }
]
```