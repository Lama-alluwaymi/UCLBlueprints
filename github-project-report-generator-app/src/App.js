import React, { useState, useEffect } from 'react';
import { Box, Heading, Link, Input, Button, Text, Divider } from '@chakra-ui/react';

import AuthorCommits from './AuthorCommits';
import Timeline from './Timeline';
import FileCommits from './FileCommits';
import FileTimelines from './FileTimelines';

import generateReport from './generateReport';

import sampleData from './sampleData.json';

function App() {
  const [token, setToken] = useState('');
  const [reqURL, setReqURL] = useState('https://github.com/ArchawinWongkittiruk/TheBackrowers');
  const [loading, setLoading] = useState(false);

  const [
    {
      url,
      name,
      mostRecentCommitSha,
      firstCommitDate,
      lastCommitDate,
      commitActivity,
      fileCommits,
    },
    setData,
  ] = useState({});

  useEffect(() => {
    setToken(localStorage.getItem('github-api-token'));
  }, []);

  const onEditToken = (e) => {
    localStorage.setItem('github-api-token', e.target.value);
    setToken(e.target.value);
  };

  const getReport = async () => {
    setLoading(true);
    setData({});
    setData(
      await generateReport(token, {
        owner: reqURL.split('/')[3],
        repo: reqURL.split('/')[4],
      })
    );
    setLoading(false);
  };

  const showSampleReport = () => {
    setData({});
    // Set a delay so the state actually resets and the report re-renders
    setTimeout(() => setData(sampleData), 1);
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

      {name && (
        <Heading mt={5} size='lg'>
          {name}
        </Heading>
      )}

      {commitActivity?.length > 0 && (
        <>
          <Divider mt={5} />
          <AuthorCommits commitActivity={commitActivity} url={url} />

          <Divider mt={5} />
          <Timeline commitActivity={commitActivity} url={url} />
        </>
      )}

      {fileCommits?.length > 0 && (
        <>
          <Divider mt={5} />
          <FileCommits
            fileCommits={fileCommits}
            authors={commitActivity.map((contributor) => contributor.author.login)}
            url={url}
            mostRecentCommitSha={mostRecentCommitSha}
          />

          <Divider mt={5} />
          <FileTimelines
            fileCommits={fileCommits}
            firstCommitDate={firstCommitDate}
            lastCommitDate={lastCommitDate}
            url={url}
            mostRecentCommitSha={mostRecentCommitSha}
          />
        </>
      )}
    </Box>
  );
}

export default App;
