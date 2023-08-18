#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const transform = require('./lib/index')

program
	.option('-s, --src <path>', 'source file path, which can be a directory or a file path(default:PWD)')
	.option('-o, --out <path>', 'output file directory(default: temp_out)')
	.option('-e, --empty', 'empty the target directory(default: false)')
	.option(
		'-q, --quiet',
		'disabled transform success log(default: false)'
	)
	.option(
		'-i, --ignore <ignoredir>',
		'ignore list of folders(default: "")',
		(value) => {
			return value.split(/\s+/)
		}
	)
	.option(
		'-f, --format',
		"format the file content(default: false)"
	)
	.action((options) => {
		transform(options)
			.then(() => {
				console.log()
				process.exit(1)
			})
			.catch((err) => {
				console.log(chalk.red(err))
				process.exit(1)
			})
	})

program
	.version(require('./package').version)
	.description(chalk.green('transform style of vue2 from scoped to css module'))

program.exitOverride();
try {
  program.parse(process.argv);
} catch (err) {
	err.code === 'commander.unknownOption' && console.log(chalk.yellow('(add --help for additional information)'))
}
