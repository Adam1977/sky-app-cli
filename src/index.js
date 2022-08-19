#!/usr/bin/env node

var yargs = require('yargs')
var inquirer = require('inquirer')

var constants = require('./constants')
var util = require('./util')

var args = yargs
  .command({
    command: 'create <name>',
    desc: 'Create a sky template.',
    builder: {},
    handler: function (argv) {
      var projectName = argv.name
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'template',
            message: 'Which template do you want?',
            choices: constants.choicesList
          }
        ])
        .then((answers) => {
          var t = constants.tempList.find((template) => {
            return template.name === answers.template
          })
          util.downloadAndDecompress(projectName, t.tag)
        })
    }
  })
  .version() // Use package.json's version
  .help()
  .alias({
    h: 'help',
    v: 'version'
  })
  .strict(true)
  .demandCommand().argv
