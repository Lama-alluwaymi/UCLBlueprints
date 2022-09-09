const { Octokit } = require('octokit');
const fs = require('fs');
require('dotenv').config();

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// Then create a .env file and put your token there
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const exampleRepo = {
  owner: 'ArchawinWongkittiruk',
  repo: 'TheBackrowers',
};

(async () => {
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  console.log('Hello, %s', login);

  callAndWrite('repo.json', 'GET /repos/{owner}/{repo}');
  callAndWrite('branches.json', 'GET /repos/{owner}/{repo}/branches');
  callAndWrite('commits.json', 'GET /repos/{owner}/{repo}/commits');
  callAndWrite('contributorStats.json', 'GET /repos/{owner}/{repo}/stats/contributors');
  callAndWrite('issues.json', 'GET /repos/{owner}/{repo}/issues?state=all');
  callAndWrite('pullRequests.json', 'GET /repos/{owner}/{repo}/pulls?state=all');

  fs.writeFileSync(
    'github-api-response-examples/tree.json',
    JSON.stringify(
      await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=true', {
        ...exampleRepo,
        tree_sha: (
          await octokit.request('GET /repos/{owner}/{repo}/commits', exampleRepo)
        ).data[0].sha,
      }),
      null,
      2
    )
  );
})();

async function callAndWrite(fileName, req) {
  fs.writeFileSync(
    'github-api-response-examples/' + fileName,
    JSON.stringify(await octokit.request(req, exampleRepo), null, 2)
  );
}
