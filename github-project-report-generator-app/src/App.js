import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Link, Input, Button, Text, Divider } from '@chakra-ui/react';

import AuthorCommits from './AuthorCommits';
import Timeline from './Timeline';
import FileCommits from './FileCommits';

import { generateBasicReport, generateFullReport } from './generateReport';

import sampleData from './sampleData.json';

function App() {
  const [token, setToken] = useState('');
  const [reqURL, setReqURL] = useState('');
  const [basicReportLoading, setBasicReportLoading] = useState(false);
  const [fullReportLoading, setFullReportLoading] = useState(false);
  const [resError, setResError] = useState('');

  const [
    {
      url,
      name,
      commitActivity,
      mostRecentCommitSha,
      firstCommitDate,
      lastCommitDate,
      fileCommits,
    },
    setData,
  ] = useState({});

  const repo = {
    owner: reqURL.split('/')[3],
    repo: reqURL.split('/')[4],
  };

  useEffect(() => {
    setToken(localStorage.getItem('github-api-token'));
  }, []);

  const onEditToken = (e) => {
    localStorage.setItem('github-api-token', e.target.value);
    setToken(e.target.value);
  };

  const getBasicReport = async () => {
    setBasicReportLoading(true);
    setResError('');
    setData({});
    try {
      setData(await generateBasicReport(token, repo));
    } catch (error) {
      setResError(error.message);
    }
    setBasicReportLoading(false);
  };

  const getFullReport = async () => {
    setFullReportLoading(true);
    setResError('');
    setData({ url, name, commitActivity });
    try {
      setData(await generateFullReport(token, repo));
    } catch (error) {
      setResError(error.message);
    }
    setFullReportLoading(false);
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
      <Input
        value={reqURL}
        onChange={(e) => setReqURL(e.currentTarget.value)}
        placeholder='https://github.com/owner/repo'
      />
      <Button
        mt={5}
        onClick={() => getBasicReport()}
        disabled={!reqURL.includes('https://github.com')}
        colorScheme='blue'
        isLoading={basicReportLoading}
        loadingText='Generating'
        mr={5}
      >
        Generate Basic Report
      </Button>
      <Button
        mt={5}
        onClick={() => getFullReport()}
        disabled={!reqURL.includes('https://github.com')}
        colorScheme='blue'
        isLoading={fullReportLoading}
        loadingText='Generating'
        mr={5}
      >
        Generate Full Report
      </Button>
      <Button mt={5} onClick={() => showSampleReport()} colorScheme='blue' variant='outline'>
        Show Sample Report
      </Button>

      <Text mt={5}>{resError}</Text>

      {name && (
        <Flex mt={5} justify='space-between' align='center' wrap='wrap'>
          <Heading size='lg'>
            <Link href={url} isExternal>
              {name}
            </Link>
          </Heading>
          <Text>{new Date().toLocaleDateString()}</Text>
        </Flex>
      )}

      {commitActivity && (
        <>
          <Divider mt={5} />
          <AuthorCommits commitActivity={commitActivity} url={url} />

          <Divider mt={5} />
          <Timeline commitActivity={commitActivity} url={url} />
        </>
      )}

      {fileCommits && (
        <>
          <Divider mt={5} />
          <FileCommits
            fileCommits={fileCommits}
            authors={commitActivity.map((contributor) => contributor.author.login)}
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
