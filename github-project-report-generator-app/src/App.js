import React, { useState, useEffect } from 'react';
import { Box, Heading, Link, Input, Button, Text, Image } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';

import { Octokit } from 'octokit';

function App() {
  const [token, setToken] = useState('');
  const [url, setURL] = useState('https://github.com/ArchawinWongkittiruk/TheBackrowers');
  const [loading, setLoading] = useState(false);

  const [authorCommitData, setAuthorCommitData] = useState([]);
  const [totalChanges, setTotalChanges] = useState(0);

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

    // https://docs.github.com/en/rest/metrics/statistics#get-all-contributor-commit-activity
    const result = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
      owner: url.split('/')[3],
      repo: url.split('/')[4],
    });
    setAuthorCommitData(result.data);
    setTotalChanges(
      result.data
        .map((contributor) =>
          contributor.weeks.map((week) => week.a + week.d).reduce((a, b) => a + b, 0)
        )
        .reduce((a, b) => a + b, 0)
    );

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
        mb={5}
      >
        Generate Report
      </Button>
      {authorCommitData.length > 0 && (
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
              {authorCommitData
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
    </Box>
  );
}

export default App;
