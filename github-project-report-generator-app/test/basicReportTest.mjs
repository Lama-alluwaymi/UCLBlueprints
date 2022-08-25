import { Octokit } from 'octokit';
import 'dotenv/config';
import assert from 'assert';

import { generateBasicReport } from '../src/generateReport.mjs';

const testRepo = {
  owner: 'ArchawinWongkittiruk',
  repo: 'TheBackrowers',
};

const { name, url, firstCommitDate, lastCommitDate, commitActivity } = await generateBasicReport(
  process.env.GITHUB_TOKEN,
  testRepo
);

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const repo = (await octokit.request('GET /repos/{owner}/{repo}', testRepo)).data;

describe('Basic report', () => {
  it('should have the right url', async () => {
    assert.equal(url, repo.html_url);
  });

  it('should have the right name', async () => {
    assert.equal(name, repo.name);
  });

  it('should have the right first commit date', async () => {
    assert.equal(firstCommitDate, repo.created_at);
  });

  it('should have the right last commit date', async () => {
    assert.equal(lastCommitDate, repo.pushed_at);
  });
});

const contributors = (
  await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', testRepo)
).data;

describe('Commit activity', () => {
  it('should have the right contributors', async () => {
    const authors = commitActivity.map((contributor) => contributor.author.login);
    for (const contributor of contributors) {
      assert(authors.some((author) => author === contributor.author.login));
    }
  });
});
