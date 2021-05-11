# Deno.watchFs

The hereby repo strives to document the behavior of `Deno.watchFs` (which is based on Rust crate `notify`) step-by-step on different systems.

Feel free to use it as reference when designing tools which rely on file watching.

- [Notes](https://github.com/tommywalkie/Deno.watchFs#notes)
- [Testing](https://github.com/tommywalkie/Deno.watchFs#testing)
- [Behaviors](https://github.com/tommywalkie/Deno.watchFs#behaviors)
  - [Add a new empty file](https://github.com/tommywalkie/Deno.watchFs#add-a-new-empty-file)
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

- Path format (`/`, `\\`, etc.) in `event.paths` depends of the OS.
- `Deno.FsEvent` doesn't provide `FileInfo` fields, you may then need to call `lstatSync` to process `event.paths`, the downside is `lstatSync` is not fast enough between quick ops (like creating a file and immediatly deleting it).
- MacOS filesystem operations seem to be _very slow_ in CI. the first `mkdirSync` command may not be completed before  starting watching the newly created folder with `Deno.watchFs`, _i.e._ this is why it may first emit a `create` event.
- Linux is the only OS granted with `access` events.
- Linux is the only OS granted with `modify` events including two paths, which can be useful for tracking moves and renames, the downside is these events always happen last.

## Testing

Clone the hereby repo and launch tests with Deno:

```sh
deno test -A --unstable
```

## Behaviors

All the hereby documented behaviors here were tested with Deno APIs, these may not reflect the ones you'll get when interacting with the watched source using any third-party tool.

From my own experience, when using Visual Studio Code, additional `modify` events may be emitted on any scenario, _e.g._ 3~4 `modify` events may happen for a single file save.

### Add a new empty file

This is the equivalent of creating an empty file entry (`touch A.txt`).

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join('<PATH>', 'A.txt'), '')
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  }
]
```

### Add a new file

This is the equivalent of creating a file entry and saving new content (`echo "Hello world" > A.txt`).

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Hello world')
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  }
]
```

### Edit a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Foo')
Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Bar')
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/jejw8egqf/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/jejw8egqf/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/jejw8egqf/A.txt" ]
  },
  /* All platforms */
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/jejw8egqf/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/jejw8egqf/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/jejw8egqf/A.txt" ]
  }
]
```

### Add a new folder

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join('<PATH>', 'foo'), { recursive: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/7ml0dad18/foo" ]
  }
]
```

### Copy a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Hello world')
Deno.copyFileSync(join('<PATH>', 'A.txt'), join('<PATH>', 'B.txt'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/e9izorrnz/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/e9izorrnz/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/e9izorrnz/A.txt" ]
  }
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/e9izorrnz/B.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/e9izorrnz/B.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/e9izorrnz/B.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/e9izorrnz/B.txt" ]
  }
]
```

### Copy a folder

Folder items will also emit events like if they were created into the new folder, with one additional `modify` event.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'
import { copySync } from 'https://deno.land/std@0.95.0/fs/mod.ts'

Deno.mkdirSync(join('<PATH>', 'foo'), { recursive: true })
Deno.writeTextFileSync(join('<PATH>', 'foo/A.txt'), 'Hello world')
copySync(join('<PATH>', 'foo'), join('<PATH>', 'bar'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/foo" ]
  },
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/foo/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/foo/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/A.txt" ]
  },
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/bar" ]
  },
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/bar/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/bar/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/bar/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/nk89mg2j0/bar/A.txt" ]
  }
]
```

### Move a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'
import { moveSync } from 'https://deno.land/std@0.95.0/fs/mod.ts'

Deno.mkdirSync(join('<PATH>', 'foo'), { recursive: true })
Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Hello world')
moveSync(join('<PATH>', 'A.txt'), join('<PATH>', 'foo/A.txt'), { overwrite: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/j3dset8ut/foo" ]
  },
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/j3dset8ut/A.txt" ]
  },
  /* All platforms */
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/i3h6cswpt/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/i3h6cswpt/foo/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "<PATH>/__TEST__/i3h6cswpt/A.txt",
      "<PATH>/__TEST__/i3h6cswpt/foo/A.txt"
    ]
  }
]
```

### Move a folder

Unlike folder copies, folder items won't emit events, so you may have to walk the new folder and register items.

```js
Deno.mkdirSync(join('<PATH>', 'foo'), { recursive: true })
Deno.mkdirSync(join('<PATH>', 'bar'), { recursive: true })
moveSync(join('<PATH>', 'foo'), join('<PATH>', 'bar/foo/'), { overwrite: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/k5nl2tstq/foo" ]
  },
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/k5nl2tstq/bar" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/k5nl2tstq/foo" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/k5nl2tstq/bar/foo" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "<PATH>/__TEST__/k5nl2tstq/foo",
      "<PATH>/__TEST__/k5nl2tstq/bar/foo"
    ]
  }
]
```

### Rename a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Hello world')
Deno.renameSync(join('<PATH>', 'A.txt'), join('<PATH>', 'B.txt'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/omi3xk5p4/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/omi3xk5p4/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/omi3xk5p4/A.txt" ]
  },
  /* All platforms */
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/omi3xk5p4/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/omi3xk5p4/B.txt" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "<PATH>/__TEST__/omi3xk5p4/A.txt",
      "<PATH>/__TEST__/omi3xk5p4/B.txt"
    ]
  }
]
```

### Rename a folder

Note that only the folder will emit events, while folder items won't.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join('<PATH>', 'foo'), { recursive: true })
Deno.renameSync(join('<PATH>', 'foo'), join('<PATH>', 'bar'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/1k8v51qih/foo" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/1k8v51qih/foo" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/1k8v51qih/bar" ]
  },
  /* Only on Linux */
  {
    kind: "modify",
    paths: [
      "<PATH>/__TEST__/1k8v51qih/foo",
      "<PATH>/__TEST__/1k8v51qih/bar"
    ]
  }
]
```

### Remove a file

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.writeTextFileSync(join('<PATH>', 'A.txt'), 'Hello world')
Deno.removeSync(join('<PATH>', 'A.txt'))
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/0c34facb9/A.txt" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/0c34facb9/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/0c34facb9/A.txt" ]
  },
  /* All platforms */
  {
    kind: "remove",
    paths: [ "<PATH>/__TEST__/0c34facb9/A.txt" ]
  }
]
```

### Remove a folder

Folder items gets removed first and emit `remove` events, then the folder gets removed and emits a `remove` event.

```js
import { join } from 'https://deno.land/std@0.95.0/path/mod.ts'

Deno.mkdirSync(join('<PATH>', 'foo'), { recursive: true })
Deno.writeTextFileSync(join('<PATH>', 'foo/A.txt'), 'Hello world')
Deno.removeSync(join('<PATH>', 'foo'), { recursive: true })
```

**Result:**

```js
[
  /* All platforms */
  {
    kind: "create",
    paths: [ "<PATH>/__TEST__/wqaw5fl3l/foo" ]
  },
  {
    kind: "modify",
    paths: [ "<PATH>/__TEST__/wqaw5fl3l/foo/A.txt" ]
  },
  /* Only on Linux */
  {
    kind: "access",
    paths: [ "<PATH>/__TEST__/wqaw5fl3l/foo/A.txt" ]
  },
  /* All platforms */
  {
    kind: "remove",
    paths: [ "<PATH>/__TEST__/wqaw5fl3l/foo/A.txt" ]
  },
  {
    kind: "remove",
    paths: [ "<PATH>/__TEST__/wqaw5fl3l/foo" ]
  }
]
```