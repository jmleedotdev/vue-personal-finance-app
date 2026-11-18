import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, test } from 'node:test'

const root = fileURLToPath(new URL('../../', import.meta.url))
const temporaryDirectories = []
// A real parent commit may export GIT_INDEX_FILE/GIT_DIR. Never let those
// redirect fixture Git commands into the developer's repository.
const isolatedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_')),
)

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true })
})

function run(cwd, command, args = [], env = {}) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...isolatedEnvironment, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', ...env },
  })
}

function repository(name = 'checkout') {
  const directory = mkdtempSync(join(tmpdir(), 'commit checks '))
  temporaryDirectories.push(directory)
  const cwd = join(directory, name)
  mkdirSync(cwd)
  for (const path of ['scripts', '.githooks']) cpSync(join(root, path), join(cwd, path), { recursive: true })
  const original = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  // Replace expensive tool processes at the package-script boundary; exercise real Git,
  // pnpm, the shared runner, installer, and hook without recursively running this suite.
  const scripts = { check: original.scripts.check, 'hooks:install': original.scripts['hooks:install'] }
  for (const name of ['lint:check', 'type-check', 'test:fast', 'build-only']) {
    scripts[name] = `node -e "console.log('${name} diagnostics'); process.exit(process.env.FAIL_CHECK === '${name}' ? 1 : 0)"`
  }
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ private: true, scripts }))
  writeFileSync(join(cwd, 'source.txt'), 'original\n')
  assert.equal(run(cwd, 'git', ['init', '-q']).status, 0)
  run(cwd, 'git', ['config', 'user.name', 'Hook Test'])
  run(cwd, 'git', ['config', 'user.email', 'hook@example.invalid'])
  run(cwd, 'git', ['add', '.'])
  return cwd
}

function install(cwd) {
  return run(cwd, 'pnpm', ['hooks:install'])
}

test('setup preserves an existing hooks-path configuration and explains integration', () => {
  const cwd = repository()
  run(cwd, 'git', ['config', 'core.hooksPath', 'custom-hooks'])
  const result = install(cwd)
  assert.notEqual(result.status, 0)
  assert.match(output(result), /integrat/i)
  assert.equal(run(cwd, 'git', ['config', '--get', 'core.hooksPath']).stdout.trim(), 'custom-hooks')
})

test('setup preserves custom hooks in the default hooks directory', () => {
  const cwd = repository()
  const hookPath = join(cwd, '.git/hooks/pre-commit')
  const hook = '#!/bin/sh\necho custom hook\n'
  writeFileSync(hookPath, hook)
  const result = install(cwd)
  assert.notEqual(result.status, 0)
  assert.match(output(result), /integrat/i)
  assert.equal(readFileSync(hookPath, 'utf8'), hook)
  assert.equal(run(cwd, 'git', ['config', '--get', 'core.hooksPath']).status, 1)
})

for (const check of ['lint:check', 'type-check', 'test:fast', 'build-only']) {
  test(`${check} failure blocks a commit, preserves diagnostics, source, and staging`, () => {
    const cwd = repository()
    assert.equal(install(cwd).status, 0)
    // Keep a partially staged file so accidental staging or source rewriting is visible.
    writeFileSync(join(cwd, 'source.txt'), 'unstaged edit\n')
    const indexBefore = run(cwd, 'git', ['write-tree']).stdout
    const diffBefore = run(cwd, 'git', ['diff', '--binary']).stdout
    const result = run(cwd, 'git', ['commit', '-m', 'must fail'], { FAIL_CHECK: check })
    assert.notEqual(result.status, 0)
    assert.match(output(result), new RegExp(`Check failed: ${check}`))
    assert.match(output(result), new RegExp(`${check} diagnostics`))
    assert.equal(run(cwd, 'git', ['rev-parse', '--verify', 'HEAD']).status, 128)
    assert.equal(run(cwd, 'git', ['write-tree']).stdout, indexBefore)
    assert.equal(run(cwd, 'git', ['diff', '--binary']).stdout, diffBefore)
    assert.equal(readFileSync(join(cwd, 'source.txt'), 'utf8'), 'unstaged edit\n')
  })
}

function output(result) {
  return result.stdout + result.stderr
}

test('setup and commits support checkout paths ending in whitespace', () => {
  const cwd = repository('checkout ')
  const setup = install(cwd)
  assert.equal(setup.status, 0, output(setup))
  const result = run(cwd, 'git', ['commit', '-m', 'whitespace checkout'])
  assert.equal(result.status, 0, output(result))
  assert.match(output(result), /build-only diagnostics/)
})

test('repeatable installation enables a passing commit without a remote', () => {
  const cwd = repository()
  assert.equal(install(cwd).status, 0)
  assert.equal(install(cwd).status, 0)
  writeFileSync(join(cwd, 'source.txt'), 'unstaged edit\n')
  const diffBefore = run(cwd, 'git', ['diff', '--binary']).stdout
  const indexBefore = run(cwd, 'git', ['write-tree']).stdout
  const result = run(cwd, 'git', ['commit', '-m', 'passing checks'])
  assert.equal(result.status, 0, output(result))
  assert.match(output(result), /build-only diagnostics/)
  assert.equal(run(cwd, 'git', ['write-tree']).stdout, indexBefore)
  assert.equal(run(cwd, 'git', ['diff', '--binary']).stdout, diffBefore)
})
