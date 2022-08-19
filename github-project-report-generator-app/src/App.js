import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Link, Input, Button, Text, Image, Divider } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';
import { Pie, PieChart } from 'recharts';

import generateReport from './generateReport';

import sampleData from './sampleData.json';

function App() {
  const [token, setToken] = useState('');
  const [reqURL, setReqURL] = useState('https://github.com/ArchawinWongkittiruk/TheBackrowers');
  const [loading, setLoading] = useState(false);

  const [url, setURL] = useState('');
  const [name, setName] = useState('');

  const [authorCommits, setAuthorCommits] = useState([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [totalChanges, setTotalChanges] = useState(0);

  const [fileAuthors, setFileAuthors] = useState([]);
  const [mostRecentCommitSha, setMostRecentCommitSha] = useState('');

  const [authorFiles, setAuthorFiles] = useState([]);

  const [fileCommitCounts, setFileCommitCounts] = useState([]);

  useEffect(() => {
    setToken(localStorage.getItem('github-api-token'));
  }, []);

  const onEditToken = (e) => {
    localStorage.setItem('github-api-token', e.target.value);
    setToken(e.target.value);
  };

  const getReport = async () => {
    setLoading(true);

    setURL('');
    setName('');
    setAuthorCommits([]);
    setTotalCommits(0);
    setTotalChanges(0);
    setFileAuthors([]);
    setMostRecentCommitSha('');
    setAuthorFiles([]);
    setFileCommitCounts([]);

    const data = await generateReport(token, {
      owner: reqURL.split('/')[3],
      repo: reqURL.split('/')[4],
    });

    setURL(data.url);
    setName(data.name);
    setAuthorCommits(data.authorCommits);
    setTotalCommits(data.totalCommits);
    setTotalChanges(data.totalChanges);
    setFileAuthors(data.fileAuthors);
    setMostRecentCommitSha(data.mostRecentCommitSha);
    setAuthorFiles(data.authorFiles);
    setFileCommitCounts(data.fileCommitCounts);

    setLoading(false);
  };

  const showSampleReport = () => {
    setURL(sampleData.url);
    setName(sampleData.name);
    setAuthorCommits(sampleData.authorCommits);
    setTotalCommits(sampleData.totalCommits);
    setTotalChanges(sampleData.totalChanges);
    setFileAuthors(sampleData.fileAuthors);
    setMostRecentCommitSha(sampleData.mostRecentCommitSha);
    setAuthorFiles(sampleData.authorFiles);
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
      <Input value={reqURL} onChange={(e) => setReqURL(e.currentTarget.value)} mb={5} />
      <Button
        onClick={() => getReport()}
        disabled={!reqURL.includes('https://github.com')}
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
        <Box>
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
                        <Link href={`${url}/commits?author=${contributor.author.login}`} isExternal>
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
          <Flex mt={5} justify='center'>
            <PieChart width={730} height={250}>
              <Pie
                data={authorCommits.map((contributor) => ({
                  name: contributor.author.login,
                  value: Math.round((contributor.total / totalCommits) * 100),
                }))}
                dataKey='value'
                nameKey='name'
                label={(entry) => `${entry.name} (${entry.value}%)`}
                isAnimationActive={false}
              />
            </PieChart>
          </Flex>
        </Box>
      )}

      <Divider mt={5} />

      <Heading size='md' my={5}>
        File Authors (Commits Made)
      </Heading>
      <Box>
        {fileAuthors.map(([file, authors]) => (
          <Text key={file} mb={2}>
            <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal>
              {file}
            </Link>
            {` - ${Object.entries(authors)
              .map(([author, commits]) => `${author} (${commits})`)
              .join(', ')}`}
          </Text>
        ))}
      </Box>

      <Divider mt={5} />

      <Heading size='md' my={5}>
        Author Files
      </Heading>
      <Box>
        {authorFiles.map(([author, files]) => (
          <Box key={author} my={5}>
            <Link href={`${url}/commits?author=${author}`} isExternal>
              <Image
                src={
                  authorCommits.find((contributor) => contributor.author.login === author).author
                    .avatar_url
                }
                boxSize='50px'
              />
              {author}
            </Link>
            {` - ${files.length} files:`}
            {files.map((file) => (
              <Text key={file}>{file}</Text>
            ))}
          </Box>
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
            {` - ${commits}`}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

export default App;
