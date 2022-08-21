import React from 'react';
import { Flex, Heading, Link, Image } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';
import { Pie, PieChart } from 'recharts';

import stringToColour from './stringToColour';

const AuthorCommits = ({ commitActivity, url }) => {
  const totalCommits = commitActivity.reduce((a, b) => a + b.total, 0);
  const totalChanges = commitActivity
    .map((contributor) =>
      contributor.weeks.map((week) => week.a + week.d).reduce((a, b) => a + b, 0)
    )
    .reduce((a, b) => a + b, 0);

  return (
    <>
      <Heading size='md' my={5}>
        Author Commits
      </Heading>
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
            {commitActivity.map((contributor) => {
              const additions = contributor.weeks.map((week) => week.a).reduce((a, b) => a + b, 0);
              const deletions = contributor.weeks.map((week) => week.d).reduce((a, b) => a + b, 0);

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
            data={commitActivity.map((contributor) => ({
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
    </>
  );
};

export default AuthorCommits;
