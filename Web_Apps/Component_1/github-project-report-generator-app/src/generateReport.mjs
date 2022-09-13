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

    // https://stackoverflow.com/a/46762417
    const getCommits = async (sha, path) =>
      await octokit.paginate(`GET /repos/{owner}/{repo}/commits?sha=${sha}&path=${path}`, {
        ...repo,
        per_page: 100,
      });

    const commits = await getCommits(basicReport.mostRecentCommitSha, file.path);

    if (commits.length === 0) continue;

    // Iteratively get commits from before file was renamed if it was renamed
    if (file.type === 'blob') {
      const getFirstCommit = async (sha) => {
        let commit = commitsWithFiles[sha];
        if (!commit) {
          // https://docs.github.com/en/rest/commits/commits#get-a-commit
          commit = (
            await octokit.paginate('GET /repos/{owner}/{repo}/commits/{ref}', {
              ...repo,
              ref: sha,
            })
          ).reduce((commit, sameCommitWithMoreFiles) => ({
            ...commit,
            files: [...commit.files, ...sameCommitWithMoreFiles.files],
          }));
          commitsWithFiles[sha] = commit;
        }
        return commit;
      };

      let firstCommit = await getFirstCommit(commits[commits.length - 1].sha);

      const getFirstCommitFile = (firstCommit, path) =>
        firstCommit.files.find(({ filename }) => filename === path);

      let { status, previous_filename } = getFirstCommitFile(firstCommit, file.path);

      while (status === 'renamed') {
        const previousFilenameCommits = (
          await getCommits(firstCommit.sha, previous_filename)
        ).slice(1);

        if (previousFilenameCommits.length === 0) break;

        commits.push(...previousFilenameCommits);

        firstCommit = await getFirstCommit(
          previousFilenameCommits[previousFilenameCommits.length - 1].sha
        );
        ({ status, previous_filename } = getFirstCommitFile(firstCommit, previous_filename));
      }
    }

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
