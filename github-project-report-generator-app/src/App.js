import React, { useState, useEffect } from 'react';
import FileSaver from 'file-saver';
import { Box, Flex, Heading, Link, Input, Button, Text, Divider } from '@chakra-ui/react';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';

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
  const [fileCommitsFetchingStatus, setFileCommitsFetchingStatus] = useState('');
  const [resError, setResError] = useState('');

  const [data, setData] = useState({});
  const {
    url,
    name,
    firstCommitDate,
    lastCommitDate,
    commitActivity,
    mostRecentCommitSha,
    fileCommits,
  } = data;

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
    try {
      setData(await generateFullReport(token, repo, setFileCommitsFetchingStatus));
    } catch (error) {
      setResError(error.message);
    }
    setFileCommitsFetchingStatus('');
    setFullReportLoading(false);
  };

  const showSampleReport = () => {
    setData(sampleData);
  };

  // https://stackoverflow.com/a/45594892
  const downloadJSONReport = () => {
    // https://stackoverflow.com/a/35869246
    const date = lastCommitDate.replace(/T.*/, '').split('-').reverse().join('-');
    FileSaver.saveAs(
      new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      }),
      `${name}-${fileCommits ? 'full' : 'basic'}-report-${date}.json`
    );
  };

  // https://stackoverflow.com/a/61707546
  const uploadJSONReport = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      setData(JSON.parse(e.target.result));
    };
  };

  return (
    <Box p={5}>
      <Heading>GitHub Project Report Generator</Heading>
      <Text mb={5}>By UCL Blueprints</Text>
      <Link href='https://github.com/settings/tokens/new?scopes=repo' isExternal>
        Your GitHub Personal Access Token <ExternalLinkIcon mx='2px' />
      </Link>
      <Input value={token} onChange={onEditToken} type='password' mb={5} />
      <Text>GitHub Repository URL</Text>
      <Input
        value={reqURL}
        onChange={(e) => setReqURL(e.currentTarget.value)}
        placeholder='https://github.com/owner/repo'
      />

      <Flex mt={5} justify='space-between' wrap='wrap' gap={5}>
        <Flex gap={5} align='center' wrap='wrap'>
          <Button
            onClick={() => getBasicReport()}
            disabled={!reqURL.includes('https://github.com')}
            colorScheme='blue'
            isLoading={basicReportLoading}
            loadingText='Generating'
          >
            Generate Basic Report
          </Button>
          <Button
            onClick={() => getFullReport()}
            disabled={!reqURL.includes('https://github.com')}
            colorScheme='blue'
            isLoading={fullReportLoading}
            loadingText='Generating'
          >
            Generate Full Report
          </Button>
          <Text>{fileCommitsFetchingStatus}</Text>
        </Flex>
        <Button onClick={() => showSampleReport()} colorScheme='blue' variant='outline'>
          Show Sample Report
        </Button>
      </Flex>

      <Flex mt={5} wrap='wrap' gap={5}>
        <Button
          onClick={() => downloadJSONReport()}
          isDisabled={Object.keys(data).length === 0}
          leftIcon={<DownloadIcon />}
        >
          Download JSON Report
        </Button>
        <Flex align='center' wrap='wrap'>
          <Text mr={4}>Upload JSON Report:</Text>
          <input type='file' onChange={uploadJSONReport} />
        </Flex>
      </Flex>

      <Text mt={5}>{resError}</Text>

      {name && (
        <>
          <Divider mt={5} />
          <Flex mt={5} justify='space-between' align='center' wrap='wrap'>
            <Heading size='lg'>
              <Link href={url} isExternal>
                {name}
              </Link>
            </Heading>
            <Text>Last commit: {new Date(lastCommitDate).toLocaleDateString()}</Text>
          </Flex>
        </>
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
