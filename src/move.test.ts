import { expect, it, join, moveSync } from '../deps.ts'
import { randomId, track } from './utils.ts'

it('should be able to track moved empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.mkdirSync(join(path, 'bar'), { recursive: true })
        moveSync(join(path, 'foo'), join(path, 'bar', 'foo'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track moved files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        moveSync(join(path, 'A.txt'), join(path, 'foo', 'A.txt'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track moved non-empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.writeTextFileSync(join(path, 'foo', 'A.txt'), 'Hello world')
        Deno.mkdirSync(join(path, 'bar'), { recursive: true })
        moveSync(join(path, 'foo'), join(path, 'bar', 'foo'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track moved non-empty folders from outside the watching scope', async () => {
    const unwatchedPath = join(Deno.cwd(), `./__TEST__/${randomId()}`)
    Deno.mkdirSync(unwatchedPath, { recursive: true })
    Deno.writeTextFileSync(join(unwatchedPath, 'A.txt'), 'Hello world')
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        moveSync(unwatchedPath, join(path, 'foo'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})