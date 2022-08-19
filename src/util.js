var fs = require('fs-extra')
var path = require('path')
var decompress = require('decompress')
var tmp = require('tmp')
var _fs = require('fs')
var chalk = require('chalk')
var infoLabel = chalk.inverse.green('INFO')
var warningLabel = chalk.inverse('WARN')
var errorLabel = chalk.inverse('ERROR')
var request = require('request').defaults({
  headers: {
    'User-Agent': 'node request' // GitHub ask for this.
  }
})

function showInfoText(msg) {
  console.log(`${infoLabel} ${msg}`)
}
function showWarnText(msg) {
  console.log(chalk.yellow(`${warningLabel} ${msg}`))
}
function showErrorText(msg) {
  console.log(chalk.red(`${errorLabel} ${msg}`))
  process.exit(1)
}

function downloadAndDecompress(projectName, tag) {
  if (fs.existsSync(projectName)) {
    showErrorText(`File ${projectName} already exist.`)
    return
  }
  showInfoText('Trying to download template...')
  var TMP_DOWNLOAD_PATH = tmp.tmpNameSync() + '.zip'
  var TMP_UNZIP_FOLDER = tmp.tmpNameSync()
  var file = fs.createWriteStream(TMP_DOWNLOAD_PATH)
  file
    .on('close', () => {
      showInfoText('Extracting...')
      decompress(TMP_DOWNLOAD_PATH, TMP_UNZIP_FOLDER).then(() => {
        showInfoText('Done extracting.')
        _fs.readdir(TMP_UNZIP_FOLDER, (err, files) => {
          fs.moveSync(path.join(TMP_UNZIP_FOLDER, files[0]), projectName) // 重命名为指定名
          fs.unlinkSync(TMP_DOWNLOAD_PATH)
        })
      })
    })
    .on('error', (err) => {
      showErrorText(err)
    })
  request
    .get(tag)
    .on('error', function (err) {
      showErrorText(`Error downloading: ${err}`)
    })
    .on('response', function (res) {
      if (res.statusCode != 200) {
        showErrorText('Get zipUrl return a non-200 response.')
      }
    })
    .on('end', function () {
      showInfoText('Download finished.')
    })
    .pipe(file)
}

module.exports = {
  downloadAndDecompress
}
