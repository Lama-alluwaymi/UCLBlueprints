import React, { useState, useEffect } from 'react';
import { Box, Heading, Link, Input, Button, Text, Image } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';

import { Octokit } from 'octokit';

function App() {
  const [token, setToken] = useState('');
  const [url, setURL] = useState('https://github.com/ArchawinWongkittiruk/TheBackrowers');
  const [loading, setLoading] = useState(false);

  const [authorCommits, setAuthorCommits] = useState([]);
  const [totalChanges, setTotalChanges] = useState(0);

  // https://stackoverflow.com/questions/46762160/get-list-of-contributors-who-have-made-commits-to-a-particular-file
  const [fileAuthors, setFileAuthors] = useState([]);
  const [mostRecentCommitSha, setMostRecentCommitSha] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('github-api-token'));
  }, []);

  const octokit = new Octokit({ auth: token });

  const onEditToken = (e) => {
    localStorage.setItem('github-api-token', e.target.value);
    setToken(e.target.value);
  };

  const fetchData = async () => {
    setLoading(true);

    const repo = {
      owner: url.split('/')[3],
      repo: url.split('/')[4],
    };

    // https://docs.github.com/en/rest/metrics/statistics#get-all-contributor-commit-activity
    const commitActivity = (
      await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', repo)
    ).data;
    setAuthorCommits(commitActivity);
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
    const tree = await octokit.request(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=true',
      {
        ...repo,
        tree_sha: treeSha,
      }
    );

    const fileContributors = {};
    for (const file of tree.data.tree) {
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

    setLoading(false);
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
        onClick={() => fetchData()}
        disabled={!url.includes('https://github.com')}
        colorScheme='blue'
        isLoading={loading}
        loadingText='Generating'
      >
        Generate Report
      </Button>
      <Text my={5}>Author Commits</Text>
      {authorCommits.length > 0 && (
        <TableContainer>
          <Table variant='simple'>
            <TableCaption placement='top'>Author Commits</TableCaption>
            <Thead>
              <Tr>
                <Th>Author</Th>
                <Th>Commits</Th>
                <Th>Additions</Th>
                <Th>Deletions</Th>
                <Th>% of Changes</Th>
                <Th>Average Commit Size (Lines Changed)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {authorCommits
                .sort((a, b) => b.total - a.total)
                .map((contributor) => {
                  const additions = contributor.weeks
                    .map((week) => week.a)
                    .reduce((a, b) => a + b, 0);
                  const deletions = contributor.weeks
                    .map((week) => week.d)
                    .reduce((a, b) => a + b, 0);

                  return (
                    <Tr key={contributor.author.login}>
                      <Td>
                        <Link href={contributor.author.html_url} isExternal>
                          <Image src={contributor.author.avatar_url} boxSize='50px' />
                          {contributor.author.login}
                        </Link>
                      </Td>
                      <Td>{contributor.total}</Td>
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
      <Text my={5}>Recent File Authors</Text>
      {fileAuthors.length > 0 && (
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
      )}
    </Box>
  );
}

export default App;
