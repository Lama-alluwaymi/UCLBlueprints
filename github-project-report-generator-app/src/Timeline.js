import React, { useState } from 'react';
import { Box, Flex, Text, Heading, Link, Image, Badge } from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';

import stringToColour from './stringToColour';

const Timeline = ({ commitActivity, url }) => {
  const [showing, setShowing] = useState('Changes');
  const weeks = commitActivity[0].weeks
    .map((week, index) => ({
      week: week.w,
      authors: commitActivity.map(({ author, weeks }) => ({
        author: author.login,
        authorWeek: weeks[index],
      })),
    }))
    .filter((week) => week.authors.some(({ authorWeek }) => authorWeek.c > 0))
    .map((week) => ({
      ...week,
      maxChanges: week.authors.reduce(
        (a, { authorWeek }) => Math.max(a, authorWeek.a + authorWeek.d),
        0
      ),
      totalChanges: week.authors.reduce(
        (a, { authorWeek }) => a + (authorWeek.a + authorWeek.d),
        0
      ),
      maxCommits: week.authors.reduce((a, { authorWeek }) => Math.max(a, authorWeek.c), 0),
      totalCommits: week.authors.reduce((a, { authorWeek }) => a + authorWeek.c, 0),
    }));

  return (
    <>
      <Flex align='center' my={5}>
        <Heading size='md' mr={5}>
          Timeline (by Week)
        </Heading>
        <Text mr={2}>Showing:</Text>
        <RadioGroup onChange={setShowing} value={showing} mr={5}>
          <Flex>
            <Radio value='Changes' mr={2}>
              Changes
            </Radio>
            <Radio value='Commits'>Commits</Radio>
          </Flex>
        </RadioGroup>
        {showing === 'Changes' && (
          <>
            <Badge colorScheme='red'>Deletions</Badge>
            <Badge colorScheme='green'>Additions</Badge>
          </>
        )}
      </Flex>
      <TableContainer>
        <Table variant='simple'>
          <TableCaption placement='top'>Timeline</TableCaption>
          <Thead>
            <Tr>
              <Th>Author</Th>
              {weeks.map(({ week }) => (
                <Th key={week}>{new Date(week * 1000).toLocaleDateString()}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {commitActivity.map(({ author }, index) => (
              <Tr key={author.login}>
                <Td>
                  <Link href={`${url}/commits?author=${author.login}`} isExternal>
                    <Image src={author.avatar_url} boxSize='50px' />
                    {author.login}
                  </Link>
                </Td>
                {weeks.map(({ week, authors, maxChanges, maxCommits }) => (
                  <Td key={week}>
                    {showing === 'Changes' ? (
                      <Box width='100%' height={5}>
                        <Box
                          width={`${(authors[index].authorWeek.d / maxChanges) * 100}%`}
                          height='100%'
                          float='left'
                          bgColor='red'
                        />
                        <Box
                          width={`${(authors[index].authorWeek.a / maxChanges) * 100}%`}
                          height='100%'
                          float='left'
                          bgColor='green'
                        />
                      </Box>
                    ) : (
                      <Box
                        width={`${(authors[index].authorWeek.c / maxCommits) * 100}%`}
                        height={5}
                        bgColor={stringToColour(authors[index].author)}
                      />
                    )}
                  </Td>
                ))}
              </Tr>
            ))}
            {showing === 'Changes' ? (
              <Tr>
                <Td>Total Changes</Td>
                {weeks.map(({ week, totalChanges }) => (
                  <Td key={week}>{totalChanges}</Td>
                ))}
              </Tr>
            ) : (
              <Tr>
                <Td>Total Commits</Td>
                {weeks.map(({ week, totalCommits }) => (
                  <Td key={week}>{totalCommits}</Td>
                ))}
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Timeline;
