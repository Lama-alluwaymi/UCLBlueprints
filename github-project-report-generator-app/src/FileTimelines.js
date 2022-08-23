import React, { useState } from 'react';
import { Box, Flex, Heading, Link, Text, Avatar, Switch } from '@chakra-ui/react';

import stringToColour from './stringToColour';

const FileTimelines = ({
  fileCommits,
  firstCommitDate,
  lastCommitDate,
  url,
  mostRecentCommitSha,
}) => {
  const [showCommits, setShowCommits] = useState(false);
  const totalTime = Math.abs(new Date(lastCommitDate) - new Date(firstCommitDate));

  return (
    <>
      <Flex align='center' my={5}>
        <Heading size='md' mr={5}>
          File Timelines
        </Heading>
        <Text mr={2}>Show Commits:</Text>
        <Flex>
          <Switch
            isChecked={showCommits}
            onChange={(e) => setShowCommits(e.target.checked)}
            mr={2}
          />
        </Flex>
      </Flex>

      <Flex justify='space-between' mb={5}>
        <Text>| {new Date(firstCommitDate).toLocaleDateString()}</Text>
        <Text>{new Date(lastCommitDate).toLocaleDateString()} |</Text>
      </Flex>

      {fileCommits.map(([file, { order, firstCommitDate: first, lastCommitDate: last }]) => {
        const leftGap = (Math.abs(new Date(first) - new Date(firstCommitDate)) / totalTime) * 100;
        const lineWidth = (Math.abs(new Date(last) - new Date(first)) / totalTime) * 100;

        return (
          <Box key={file} mb={5}>
            <Flex>
              <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal mr={4}>
                {file}:
              </Link>
              <Text mr={4}>First commit: {new Date(first).toLocaleDateString()}</Text>
              <Text>Last commit: {new Date(last).toLocaleDateString()}</Text>
            </Flex>
            <Box width={showCommits ? '99%' : '100%'} height={2} mt={4}>
              <Box float='left' height='100%' width={`${leftGap}%`} />
              <Flex
                position='relative'
                height='100%'
                bgColor='black'
                width={`${lineWidth}%`}
                align='center'
              >
                {showCommits &&
                  order.map(({ author, date }) => (
                    <Avatar
                      key={date}
                      name={author}
                      size='xs'
                      bgColor={stringToColour(author)}
                      position='absolute'
                      left={`${
                        (Math.abs(new Date(date) - new Date(first)) /
                          Math.abs(new Date(last) - new Date(first))) *
                        100
                      }%`}
                    />
                  ))}
              </Flex>
            </Box>
          </Box>
        );
      })}
    </>
  );
};

export default FileTimelines;
