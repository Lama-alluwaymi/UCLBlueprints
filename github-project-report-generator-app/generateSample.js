const { Octokit } = require('octokit');
const fs = require('fs');
require('dotenv').config();

// Copied from src/generateReport rather than imported straight because Node module syntax is
// different from ES6 module syntax so they're not really interoperable. Not the most elegant
// solution but it is what it is
async function generateReport(octokitAuth, repo) {
  const octokit = new Octokit({ auth: octokitAuth });

  // https://docs.github.com/en/rest/repos/repos#get-a-repository
  const { name, html_url } = (await octokit.request('GET /repos/{owner}/{repo}', repo)).data;

  // https://docs.github.com/en/rest/metrics/statistics#get-all-contributor-commit-activity
  const commitActivity = (
    await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', repo)
  ).data;

  // https://docs.github.com/en/rest/commits/commits#list-commits
  const treeSha = (await octokit.request('GET /repos/{owner}/{repo}/commits', repo)).data[0].sha;

  // https://docs.github.com/en/rest/git/trees#get-a-tree
  const tree = (
    await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=true', {
      ...repo,
      tree_sha: treeSha,
    })
  ).data.tree;

  const fileCommits = {};
  for (const file of tree) {
    // https://stackoverflow.com/a/46762417
    const commits = await octokit.paginate(`GET /repos/{owner}/{repo}/commits?path=${file.path}`, {
      ...repo,
      per_page: 100,
    });

    const authors = {};
    const order = [];
    for (const { author, commit } of commits) {
      // Some commits have a null author, which can lead to the file commit count and
      // the sum of the shown authors' commits not being equal for some files
      if (!author) continue;
      if (!authors[author.login]) {
        authors[author.login] = 1;
      } else {
        authors[author.login]++;
      }
      order.push({ author: author.login, date: commit.committer.date });
    }

    // Therefore, to be consistent, the commit count output should be the author commits' sums
    // rather than the seemingly more intuitive commits.length
    fileCommits[file.path] = {
      authors: Object.fromEntries(Object.entries(authors).sort((a, b) => b[1] - a[1])),
      commits: Object.values(authors).reduce((a, b) => a + b, 0),
      order: order,
      firstCommitDate: order[order.length - 1].date,
      lastCommitDate: order[0].date,
    };

    console.log(file.path);
  }

  const allCommits = await octokit.paginate('GET /repos/{owner}/{repo}/commits', {
    ...repo,
    per_page: 100,
  });

  return {
    url: html_url,
    name: name,
    mostRecentCommitSha: treeSha,
    firstCommitDate: allCommits[allCommits.length - 1].commit.committer.date,
    lastCommitDate: allCommits[0].commit.committer.date,
    commitActivity: commitActivity.sort((a, b) => b.total - a.total),
    fileCommits: Object.entries(fileCommits),
  };
}

(async () => {
  fs.writeFileSync(
    'src/sampleData.json',
    JSON.stringify(
      // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
      // Then create a .env file and put your token there
      await generateReport(process.env.GITHUB_TOKEN, {
        owner: 'ArchawinWongkittiruk',
        repo: 'TheBackrowers',
      }),
      null,
      2
    )
  );
})();
