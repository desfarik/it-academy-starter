import {isValidTitle, isValidUserName} from '../titile.utils'

const core = require('@actions/core')
const github = require('@actions/github')

function isValidPullRequestName(title) {
  const parts = title.split('/')
  return isValidUserName(parts[0]) && isValidTitle(parts[1])
}

function run() {
  const githubContext = github.context
  const title = githubContext.payload.pull_request && githubContext.payload.pull_request.title || ''
  if (isValidPullRequestName(title)) {
    core.info('Pull Request Name is clear');
    return;
  }
  core.setFailed("Error in Pull Request Name")
}

try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
