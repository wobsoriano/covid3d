const TimeSeries = require('./TimeSeries');
const github = require('@actions/github');

async function createCommit(octokit, { owner, repo, base, changes }) {
  let response;

  if (!base) {
    response = await octokit.repos.get({ owner, repo });
    base = response.data.default_branch;
  }

  response = await octokit.repos.listCommits({
    owner,
    repo,
    sha: base,
    per_page: 1,
  });
  let latestCommitSha = response.data[0].sha;
  const treeSha = response.data[0].commit.tree.sha;

  response = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: Object.keys(changes.files).map((path) => {
      return {
        path,
        mode: '100644',
        content: changes.files[path],
      };
    }),
  });
  const newTreeSha = response.data.sha;

  response = await octokit.git.createCommit({
    owner,
    repo,
    message: changes.commit,
    tree: newTreeSha,
    parents: [latestCommitSha],
  });
  latestCommitSha = response.data.sha;

  await octokit.git.updateRef({
    owner,
    repo,
    sha: latestCommitSha,
    ref: `heads/master`,
    force: true,
  });

  console.log('Project saved');
}

async function run() {
  const octokit = github.getOctokit(process.env.PROFILE_TOKEN);
  const { data: user } = await octokit.users.getAuthenticated();

  const data = await TimeSeries.fetchTimeSeries();

  createCommit(octokit, {
    owner: user.login,
    repo: 'covid3d',
    changes: {
      commit: 'Update cases data',
      files: {
        'backend/data.json': JSON.stringify(data),
      },
    },
  });
}

run();
