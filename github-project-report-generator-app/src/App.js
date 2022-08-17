import React, { useState, useEffect } from 'react';
import { Box, Heading, Link, Input, Button, Text, Image, Divider } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';

import { Octokit } from 'octokit';

import sampleData from './sampleData.json';

function App() {
  const [token, setToken] = useState('');
  const [url, setURL] = useState('https://github.com/ArchawinWongkittiruk/TheBackrowers');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');

  const [authorCommits, setAuthorCommits] = useState([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [totalChanges, setTotalChanges] = useState(0);

  const [fileAuthors, setFileAuthors] = useState([]);
  const [mostRecentCommitSha, setMostRecentCommitSha] = useState('');

  const [fileCommitCounts, setFileCommitCounts] = useState([]);

  useEffect(() => {
    setToken(localStorage.getItem('github-api-token'));
  }, []);

  const octokit = new Octokit({ auth: token });

  const onEditToken = (e) => {
    localStorage.setItem('github-api-token', e.target.value);
    setToken(e.target.value);
  };

  const generateReport = async () => {
    setLoading(true);

    setName('');
    setAuthorCommits([]);
    setTotalCommits(0);
    setTotalChanges(0);
    setFileAuthors([]);
    setMostRecentCommitSha('');
    setFileCommitCounts([]);

    const repo = {
      owner: url.split('/')[3],
      repo: url.split('/')[4],
    };

    // https://docs.github.com/en/rest/repos/repos#get-a-repository
    const repoName = (await octokit.request('GET /repos/{owner}/{repo}', repo)).data.name;
    setName(repoName);

    // https://docs.github.com/en/rest/metrics/statistics#get-all-contributor-commit-activity
    const commitActivity = (
      await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', repo)
    ).data;
    setAuthorCommits(commitActivity.sort((a, b) => b.total - a.total));
    setTotalCommits(commitActivity.reduce((a, b) => a + b.total, 0));
    setTotalChanges(
      commitActivity
        .map((contributor) =>
          contributor.weeks.map((week) => week.a + week.d).reduce((a, b) => a + b, 0)
        )
        .reduce((a, b) => a + b, 0)
    );

    // https://docs.github.com/en/rest/commits/commits#list-commits
    const treeSha = (await octokit.request('GET /repos/{owner}/{repo}/commits', repo)).data[0].sha;
    setMostRecentCommitSha(treeSha);

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
        await octokit.request('GET /repos/{owner}/{repo}/commits?path=' + file.path, repo)
      ).data;

      const authors = [];
      for (const commit of commits) {
        if (!authors.includes(commit.commit.author.name)) {
          authors.push(commit.commit.author.name);
        }
      }

      fileContributors[file.path] = authors;
    }
    setFileAuthors(Object.entries(fileContributors));

    const fileCommits = {};
    for (const file of tree) {
      // https://stackoverflow.com/a/62867468
      const commits = (
        await octokit.request(
          'GET /repos/{owner}/{repo}/commits?per_page=1&path=' + file.path,
          repo
        )
      ).headers.link
        .split(',')[1]
        .match(/.*page=(?<page_num>\d+)/).groups.page_num;

      fileCommits[file.path] = parseInt(commits);
    }
    setFileCommitCounts(Object.entries(fileCommits).sort((a, b) => b[1] - a[1]));

    setLoading(false);
  };

  const showSampleReport = () => {
    setName(sampleData.name);
    setAuthorCommits(sampleData.authorCommits);
    setTotalCommits(sampleData.totalCommits);
    setTotalChanges(sampleData.totalChanges);
    setFileAuthors(sampleData.fileAuthors);
    setMostRecentCommitSha(sampleData.mostRecentCommitSha);
    setFileCommitCounts(sampleData.fileCommitCounts);
  };

  return (
    <Box p={5}>
      <Heading>GitHub Project Report Generator</Heading>
      <Text mb={5}>By UCL Blueprints</Text>
      <Link href='https://github.com/settings/tokens/new?scopes=repo' isExternal>
        Your GitHub Personal Access Token
      </Link>
      <Input value={token} onChange={onEditToken} type='password' mb={5} />
      <Text>GitHub Repository URL</Text>
      <Input value={url} onChange={(e) => setURL(e.currentTarget.value)} mb={5} />
      <Button
        onClick={() => generateReport()}
        disabled={!url.includes('https://github.com')}
        colorScheme='blue'
        isLoading={loading}
        loadingText='Generating'
        mr={5}
      >
        Generate Report
      </Button>
      <Button onClick={() => showSampleReport()} colorScheme='blue' variant='outline'>
        Show Sample Report
      </Button>

      <Heading mt={5} size='lg'>
        {name}
      </Heading>

      <Divider mt={5} />

      <Heading size='md' my={5}>
        Author Commits
      </Heading>
      {authorCommits.length > 0 && (
        <TableContainer>
          <Table variant='simple'>
            <TableCaption placement='top'>Author Commits</TableCaption>
            <Thead>
              <Tr>
                <Th>Author</Th>
                <Th>Commits (% of Total)</Th>
                <Th>Additions</Th>
                <Th>Deletions</Th>
                <Th>% of Changes</Th>
                <Th>Average Commit Size by Lines Changed</Th>
              </Tr>
            </Thead>
            <Tbody>
              {authorCommits.map((contributor) => {
                const additions = contributor.weeks
                  .map((week) => week.a)
                  .reduce((a, b) => a + b, 0);
                const deletions = contributor.weeks
                  .map((week) => week.d)
                  .reduce((a, b) => a + b, 0);

                return (
                  <Tr key={contributor.author.login}>
                    <Td>
                      <Link href={url + '/commits?author=' + contributor.author.login} isExternal>
                        <Image src={contributor.author.avatar_url} boxSize='50px' />
                        {contributor.author.login}
                      </Link>
                    </Td>
                    <Td>
                      {contributor.total} ({Math.round((contributor.total / totalCommits) * 100)}
                      %)
                    </Td>
                    <Td>{additions}</Td>
                    <Td>{deletions}</Td>
                    <Td>{Math.round(((additions + deletions) / totalChanges) * 100)}</Td>
                    <Td>{Math.round((additions + deletions) / contributor.total)}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Divider mt={5} />

      <Heading size='md' my={5}>
        Recent File Authors
      </Heading>
      <Box>
        {fileAuthors.map(([file, authors]) => (
          <Text key={file} mb={2}>
            <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal>
              {file}
            </Link>
            {' - '}
            {authors.join(', ')}
          </Text>
        ))}
      </Box>

      <Divider mt={5} />

      <Heading size='md' my={5}>
        Most Frequently Modified Files by Number of Commits
      </Heading>
      <Box>
        {fileCommitCounts.map(([file, commits]) => (
          <Text key={file} mb={2}>
            <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal>
              {file}
            </Link>
            {' - '}
            {commits}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

export default App;
