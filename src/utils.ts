import { join } from '../deps.ts'

export function randomId() {
    return Math.random().toString(36).substr(2, 9)
}

/**
 * Set up an isolated test folder path and watch for occurred events, given a callback
 */
export async function track(fn: (path: string) => void): Promise<Array<Deno.FsEvent>> {
    const path = join(Deno.cwd(), './__TEST__', `./${randomId()}`)
    Deno.mkdirSync(path, { recursive: true })
    const watcher = Deno.watchFs(path)
    setTimeout(() => (watcher as any).return(), 1800)
    setTimeout(() => fn(path), 400)
    const occurredEvents = []
    for await (const event of watcher) {
        occurredEvents.push(event)
    }
    return occurredEvents
}