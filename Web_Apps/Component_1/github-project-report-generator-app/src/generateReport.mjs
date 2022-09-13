import { Octokit } from 'octokit';

export async function generateBasicReport(octokitAuth, repo) {
  const octokit = new Octokit({ auth: octokitAuth });

  // https://docs.github.com/en/rest/repos/repos#get-a-repository
  const { name, html_url } = (await octokit.request('GET /repos/{owner}/{repo}', repo)).data;

  // https://docs.github.com/en/rest/commits/commits#list-commits
  const commits = await octokit.paginate('GET /repos/{owner}/{repo}/commits', {
    ...repo,
    per_page: 100,
  });

  // https://docs.github.com/en/rest/metrics/statistics#get-all-contributor-commit-activity
  const commitActivity = (
    await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', repo)
  ).data;

  return {
    url: html_url,
    name: name,
    firstCommitDate: commits[commits.length - 1].commit.committer.date,
    lastCommitDate: commits[0].commit.committer.date,
    mostRecentCommitSha: commits[0].sha,
    commitActivity: commitActivity.sort((a, b) => b.total - a.total),
  };
}

export async function generateFullReport(octokitAuth, repo, setFileCommitsFetchingStatus) {
  const octokit = new Octokit({ auth: octokitAuth });

  const basicReport = await generateBasicReport(octokitAuth, repo);

  // https://docs.github.com/en/rest/git/trees#get-a-tree
  const tree = (
    await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=true', {
      ...repo,
      tree_sha: basicReport.mostRecentCommitSha,
    })
  ).data.tree;

  const commitsWithFiles = {}; // Cache some commits so they don't have to be constantly re-fetched
  const fileCommits = {};
  for (const file of tree) {
    setFileCommitsFetchingStatus(
      `Fetching commits for: ${file.path.substring(0, 50)}${file.path.length > 50 ? '...' : ''} (${
        tree.findIndex((treeFile) => treeFile.path === file.path) + 1
      }/${tree.length})`
    );

    // To recursively get commits from before file was renamed if it was renamed
    const getAllCommits = async (sha, path) => {
      // https://stackoverflow.com/a/46762417
      const commits = await octokit.paginate(
        `GET /repos/{owner}/{repo}/commits?sha=${sha}&path=${path}`,
        {
          ...repo,
          per_page: 100,
        }
      );

      if (commits.length === 0) return [];

      if (file.type === 'blob') {
        const firstCommitSha = commits[commits.length - 1].sha;

        let firstCommit = commitsWithFiles[firstCommitSha];
        if (!firstCommit) {
          // https://docs.github.com/en/rest/commits/commits#get-a-commit
          firstCommit = (
            await octokit.paginate('GET /repos/{owner}/{repo}/commits/{ref}', {
              ...repo,
              ref: firstCommitSha,
            })
          ).reduce((commit, sameCommitWithMoreFiles) => ({
            ...commit,
            files: [...commit.files, ...sameCommitWithMoreFiles.files],
          }));
          commitsWithFiles[firstCommitSha] = firstCommit;
        }

        const { status, previous_filename } = firstCommit.files.find(
          ({ filename }) => filename === path
        );

        if (status === 'renamed') {
          commits.push(...(await getAllCommits(firstCommit.sha, previous_filename)).slice(1));
        }
      }

      return commits;
    };

    const commits = await getAllCommits(basicReport.mostRecentCommitSha, file.path);

    const authors = {};
    const order = [];
    for (const { author, commit, html_url } of commits) {
      // Some commits have a null author, which can lead to the file commit count and
      // the sum of the shown authors' commits not being equal for some files
      if (!author) continue;
      if (!authors[author.login]) {
        authors[author.login] = 1;
      } else {
        authors[author.login]++;
      }
      order.push({
        author: author.login,
        date: commit.committer.date,
        message: commit.message,
        html_url,
      });
    }
    if (order.length === 0) continue;
    order.reverse();

    // Therefore, to be consistent, the commit count output should be the author commits' sums
    // rather than the seemingly more intuitive commits.length
    fileCommits[file.path] = {
      authors: Object.fromEntries(Object.entries(authors).sort((a, b) => b[1] - a[1])),
      commits: Object.values(authors).reduce((a, b) => a + b, 0),
      order: order,
      firstCommitDate: order[0].date,
      lastCommitDate: order[order.length - 1].date,
    };
  }

  return {
    ...basicReport,
    fileCommits: Object.entries(fileCommits),
  };
}
