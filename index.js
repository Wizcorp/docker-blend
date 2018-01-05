const cp = require('child_process')
const fs = require('fs')
const rimraf = require('rimraf')
const merge = require('@alexlafroscia/yaml-merge')
const homedir = require('os').homedir()
const path = require('path')

// Following code extracted from https://github.com/chalk/ansi-styles/blob/master/index.js
const colors = {
  magenta: [35, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39]
}

function colorize(colorName, ...args) {
  const color = colors[colorName]
  return `\u001B[${color[0]}m${args.join(' ')}\u001B[${color[1]}m`
}

const arrow = colorize('magenta', '>>')

// Log helpers
function info(...args) {
  console.log(colorize('green', 'info'), arrow, ...args)
}

function warn(...args) {
  console.log(colorize('yellow', 'warn'), arrow, ...args)
}

function error(...args) {
  console.error(colorize('red', 'error'), arrow, ...args)
}

function showHelp() {
  info('Usage: docker-blend [stack|compose] [...arguments]')
}

function generateConfig() {
  // NODE_ENV verification
  const { NODE_ENV } = process.env

  if (!NODE_ENV) {
    error('Please set your NODE_ENV environment')
    process.exit(1)
  }

  // Apped configuration override if present
  const tempFile = `.docker-compose.blend.yml`
  process.on('exit', () => rimraf.sync(tempFile))

  const override = `docker-compose/${NODE_ENV}.yml`

  try {
    fs.accessSync(override)
    info('configuration', override, 'found, loading')
    fs.writeFileSync(tempFile, merge('docker-compose.yml', override))
  } catch (error) {
    warn('configuration', override, 'does not exist, skipping')
    fs.copyFileSync('docker-compose.yml', tempFile)
  }

  return tempFile
}
function getCommand(argv) {
  const name = argv[2]
  const args = argv.slice(3)
  const configFile = generateConfig()

  switch (name) {
    case 'compose':
      return {
        command: 'docker-compose',
        args: [
          '-f',
          configFile
        ].concat(args)
      }
      break

    case 'stack':
      return {
        command: 'docker',
        args: args.concat([
          'stack',
          `--compose-file=${tempFile}`
        ])
      }
      break

    default:
      showHelp()
      process.exit(1)
  }
}

// Command and base arguments
const { command, args } = getCommand(process.argv)

// Run process and pipe it
info('running ' + command)
const proc = cp.spawn(command, args, {
  stdio: [process.stdin, process.stdout, process.stderr]
})

proc.on('exit', function (code) {
  info(command + ' exited with code:', code)

  if (code === 2) {
    code = 0 // Ignore SIGINT
  }

  process.exit(code)
})

function onSignal(signal) {
  process.on(signal, () => proc.kill(signal))
}

onSignal('SIGTERM')
onSignal('SIGINT')
