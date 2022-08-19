const { Octokit } = require('octokit');

module.exports = async (octokitAuth, repo) => {
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

  const fileContributors = {};
  const fileCommits = {};
  for (const file of tree) {
    // https://stackoverflow.com/a/46762417
    const commits = await octokit.paginate(`GET /repos/{owner}/{repo}/commits?path=${file.path}`, {
      ...repo,
      per_page: 100,
    });

    const authors = {};
    for (const commit of commits) {
      // Some commits have a null author
      if (!commit.author) continue;
      if (!authors[commit.author.login]) {
        authors[commit.author.login] = 1;
      } else {
        authors[commit.author.login]++;
      }
    }

    fileContributors[file.path] = authors;
    fileCommits[file.path] = parseInt(commits.length);

    console.log(file.path);
  }

  const contributorFiles = commitActivity.map((contributor) => [contributor.author.login, []]);
  for (const [contributor, files] of contributorFiles) {
    for (const [file, authors] of Object.entries(fileContributors)) {
      if (authors[contributor]) {
        files.push(file);
      }
    }
  }

  return {
    url: html_url,
    name: name,
    authorCommits: commitActivity.sort((a, b) => b.total - a.total),
    totalCommits: commitActivity.reduce((a, b) => a + b.total, 0),
    totalChanges: commitActivity
      .map((contributor) =>
        contributor.weeks.map((week) => week.a + week.d).reduce((a, b) => a + b, 0)
      )
      .reduce((a, b) => a + b, 0),
    mostRecentCommitSha: treeSha,
    fileAuthors: Object.entries(fileContributors),
    authorFiles: contributorFiles.sort((a, b) => b[1].length - a[1].length),
    fileCommitCounts: Object.entries(fileCommits).sort((a, b) => b[1] - a[1]),
  };
};
