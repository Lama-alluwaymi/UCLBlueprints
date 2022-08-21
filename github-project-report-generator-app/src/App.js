import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Link, Input, Button, Text, Image, Divider } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';
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

  const [fileCommits, setFileCommits] = useState([]);
  const [mostRecentCommitSha, setMostRecentCommitSha] = useState('');

  const [sortType, setSortType] = useState('Default');
  const [shownAuthors, setShownAuthors] = useState([]);

  const authors = authorCommits.map((contributor) => contributor.author.login);
  const shownFileCommits = fileCommits.filter((file) =>
    shownAuthors.some((author) => file[1].authors[author])
  );

  useEffect(() => {
    setToken(localStorage.getItem('github-api-token'));
  }, []);

  const onEditToken = (e) => {
    localStorage.setItem('github-api-token', e.target.value);
    setToken(e.target.value);
  };

  const clearReport = () => {
    setURL('');
    setName('');
    setAuthorCommits([]);
    setTotalCommits(0);
    setTotalChanges(0);
    setFileCommits([]);
    setMostRecentCommitSha('');

    setShownAuthors([]);
  };

  const setReport = (data) => {
    setURL(data.url);
    setName(data.name);
    setAuthorCommits(data.authorCommits);
    setTotalCommits(data.totalCommits);
    setTotalChanges(data.totalChanges);
    setFileCommits(data.fileCommits);
    setMostRecentCommitSha(data.mostRecentCommitSha);

    setShownAuthors(data.authorCommits.map((contributor) => contributor.author.login));
  };

  const getReport = async () => {
    setLoading(true);
    clearReport();
    setReport(
      await generateReport(token, {
        owner: reqURL.split('/')[3],
        repo: reqURL.split('/')[4],
      })
    );
    setLoading(false);
  };

  const showSampleReport = () => {
    clearReport();
    setReport(sampleData);
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
                  fill: stringToColour(contributor.author.login),
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

      <Flex align='center' my={5}>
        <Heading size='md' mr={5}>
          File Authors (Commits Made)
        </Heading>
        <Text mr={2}>Sort by:</Text>
        <RadioGroup onChange={setSortType} value={sortType}>
          <Flex>
            <Radio value='Default' mr={2}>
              Default
            </Radio>
            <Radio value='Commits'>Commits</Radio>
          </Flex>
        </RadioGroup>
      </Flex>
      <Checkbox
        isChecked={shownAuthors.length === authors.length}
        onChange={(e) => setShownAuthors(e.target.checked ? authors : [])}
      >
        Select/Deselect All
      </Checkbox>
      <Divider />
      <CheckboxGroup value={shownAuthors}>
        <Flex>
          {authorCommits.map(({ author: { login: author } }) => (
            <Checkbox
              key={author}
              value={author}
              onChange={(e) =>
                setShownAuthors(
                  e.target.checked
                    ? [...shownAuthors, author]
                    : shownAuthors.filter((a) => a !== author)
                )
              }
              mr={4}
            >
              {author}
            </Checkbox>
          ))}
        </Flex>
      </CheckboxGroup>
      <Box mt={5}>
        {fileCommits.length > 0 && <Text mb={5}>{shownFileCommits.length} files:</Text>}
        {shownFileCommits
          .sort((a, b) => (sortType === 'Default' ? 0 : b[1].commits - a[1].commits))
          .map(([file, { authors, commits: totalCommits }]) => (
            <Box key={file} mb={4}>
              <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal>
                {file}
              </Link>
              {` - ${totalCommits} commit${totalCommits > 1 ? 's' : ''} by: `}
              <Flex mb={2}>
                {Object.entries(authors).map(([author, commits]) => (
                  <Text
                    key={author}
                    color={stringToColour(author)}
                    fontWeight={shownAuthors.includes(author) ? 'bold' : 'normal'}
                    mr={2}
                  >
                    {author} ({commits}),
                  </Text>
                ))}
              </Flex>
              {/* https://stackoverflow.com/a/49828563 */}
              <Box width='100%' height={2}>
                {Object.entries(authors).map(([author, commits]) => (
                  <Box
                    key={author}
                    width={`${(commits / totalCommits) * 100}%`}
                    height={2}
                    float='left'
                    bgColor={stringToColour(author)}
                  />
                ))}
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  );
}

// https://stackoverflow.com/a/66494926
function stringToColour(stringInput) {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
}

export default App;
