const core = require('@actions/core')
import * as github from '@actions/github'
import { verifyUserName } from '../titile.utils'

const DOES_NOT_MATCH = 'не соотвествует [см. README](https://github.com/desfarik/it-academy-156-21/blob/master/README.md)'

function merge (client, pullRequest) {
  return client.rest.pulls.merge({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
  })
}

function createReview (client, comment, pullRequest, type) {
  return client.rest.pulls.createReview({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    body: comment,
    event: type
  })
}

function isLessonTitle (title) {
  return /lesson[_ ]\d+/ig.test(title)
}

function isHomeworkTitle (title) {
  return /homework[_ ]\d+/ig.test(title)
}

function isLessonBranch (branchName) {
  const parts = branchName.split('/')
  return verifyUserName(parts[0]) && isLessonTitle(parts[1])
}

function isHomeworkBranch (branchName) {
  const parts = branchName.split('/')
  return verifyUserName(parts[0]) && isHomeworkTitle(parts[1])
}

function isValidBranch (branchName) {
  return isLessonBranch(branchName) || isHomeworkBranch(branchName)
}

function isValidTitle (title) {
  return isLessonTitle(title) || isHomeworkTitle(title)
}

function run () {
  const repoTokenInput = core.getInput('repo-token', {required: true})
  const githubClient = github.getOctokit(repoTokenInput)
  const githubContext = github.context
  const pullRequest = githubContext.issue
  const title = githubContext.payload.pull_request && githubContext.payload.pull_request.title || ''
  const branchName = core.getInput('branch-name', {required: true})
  let comments = '**BRANCH_CHECKER**\nОтчет:\n'
  comments += `PR name \`\`\`${title}\`\`\`: ${isValidTitle(title) ? 'ОК' : DOES_NOT_MATCH}\n`
  comments += `Branch name \`\`\`${branchName}\`\`\`: ${isValidBranch(branchName) ? 'ОК' : DOES_NOT_MATCH}\n`

  if (isLessonBranch(branchName) && isLessonTitle(title)) {
    comments += '\n**Молодец, сейчас замержим!**'
    createReview(githubClient, comments, pullRequest, 'APPROVE')
      .then(() => {
        const ownerToken = core.getInput('owner-token', {required: true})
        const ownerClient = github.getOctokit(ownerToken)
        return merge(ownerClient, pullRequest)
      })
    return
  }
  if (isHomeworkBranch(branchName) && isHomeworkTitle(title)) {
    comments += '\n**Молодец, названия верны!!**'
    createReview(githubClient, comments, pullRequest, 'COMMENT')
    return
  }
  comments += '\n**Ошибка в названиях, исправьте!!**'
  createReview(githubClient, comments, pullRequest, 'REQUEST_CHANGES')
  core.setFailed("Error in branch name or pr title")
}

try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
