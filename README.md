# Deno.watchFs

The hereby repo strives to document the behavior of `Deno.watchFs` (which is based on Rust crate `notify`) step-by-step on different systems.

Feel free to use it as reference when designing tools which rely on file watching.

## Notes

I've been using [The Event Guide](https://github.com/notify-rs/notify/wiki/The-Event-Guide#platform-specific-behaviour) from `notify` wiki, but here a few notes from my tests:

- AFAIK, MacOS filesystem operations are _waaay slower_ than in other platforms. the first `mkdir` command may not be completed before  `Deno.watchFs` is being used, _i.e._ this is why it may first emit a `create` event for the watched source.
- On Windows, `modify` events can be both content and metadata changes (file size included), you may need to periodically de-duplicate `modify` events.
- Linux is the only OS granted with `access` events and `modify` events for renamed entries (including two paths)
- If your use case is tracking files, consider using `walkSync` to retrieve existing entries when running `Deno.watchFs`, then when new folders gets added or when some `modify` event happens with a folder (this can be either renames or removals), because folder items' events won't happen.

### Adding a new file

TODO

### Writing a new file

TODO

### Editing a file

TODO

### Adding a new empty folder

TODO

### Copy a file

TODO

### Copy an empty folder

TODO

### Copy a non-empty folder

TODO

### Move a file

TODO

### Move an empty folder

TODO

### Move a non-empty folder

TODO

### Rename a file

TODO

### Rename an empty folder

TODO

### Rename a non-empty folder

TODO