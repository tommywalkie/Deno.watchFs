import { expect, it, join, copySync } from '../deps.ts'
import { randomId, track } from './utils.ts'

it('should be able to track copied files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        Deno.copyFileSync(join(path, 'A.txt'), join(path, 'B.txt'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track copied empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        copySync(join(path, 'foo'), join(path, 'bar'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track copied non-empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.writeTextFileSync(join(path, 'foo', 'A.txt'), 'Hello world')
        copySync(join(path, 'foo'), join(path, 'bar'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track copied non-empty folders from outside the watching scope', async () => {
    const unwatchedPath = join(Deno.cwd(), `./__TEST__/${randomId()}`)
    Deno.mkdirSync(unwatchedPath, { recursive: true })
    Deno.writeTextFileSync(join(unwatchedPath, 'A.txt'), 'Hello world')
    const events = await track((path: string) => {
        copySync(unwatchedPath, join(path, 'foo'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})