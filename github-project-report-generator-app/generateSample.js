const { Octokit } = require('octokit');
const fs = require('fs');
require('dotenv').config();

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// Then create a .env file and put your token there
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const repo = {
  owner: 'ArchawinWongkittiruk',
  repo: 'TheBackrowers',
};

(async () => {
  // https://docs.github.com/en/rest/repos/repos#get-a-repository
  const repoName = (await octokit.request('GET /repos/{owner}/{repo}', repo)).data.name;

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
  for (const file of tree) {
    // https://stackoverflow.com/a/46762417
    const commits = (
      await octokit.request(`GET /repos/{owner}/{repo}/commits?path=${file.path}`, repo)
    ).data;

    const authors = [];
    for (const commit of commits) {
      // Some commits have a null author
      try {
        if (!authors.includes(commit.author.login)) {
          authors.push(commit.author.login);
        }
      } catch (error) {
        continue;
      }
    }

    fileContributors[file.path] = authors;

    console.log(file.path);
  }

  const contributorFiles = commitActivity.map((contributor) => [contributor.author.login, []]);
  for (const [contributor, files] of contributorFiles) {
    for (const [file, authors] of Object.entries(fileContributors)) {
      if (authors.includes(contributor)) {
        files.push(file);
      }
    }
  }

  const fileCommits = {};
  for (const file of tree) {
    // https://stackoverflow.com/a/62867468
    const commits = (
      await octokit.request(`GET /repos/{owner}/{repo}/commits?per_page=1&path=${file.path}`, repo)
    ).headers.link
      .split(',')[1]
      .match(/.*page=(?<page_num>\d+)/).groups.page_num;

    fileCommits[file.path] = parseInt(commits);

    console.log(file.path);
  }

  fs.writeFileSync(
    'src/sampleData.json',
    JSON.stringify(
      {
        name: repoName,
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
      },
      null,
      2
    )
  );
})();
