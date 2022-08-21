import React, { useState } from 'react';
import { Box, Flex, Heading, Link, Text, Divider } from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

import stringToColour from './stringToColour';

const FileCommits = ({ fileCommits, authors, url, mostRecentCommitSha }) => {
  const [sortType, setSortType] = useState('Default');
  const [selectedAuthors, setSelectedAuthors] = useState(authors);
  const shownFileCommits = fileCommits.filter((file) =>
    selectedAuthors.some((author) => file[1].authors[author])
  );

  return (
    <>
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
        isChecked={selectedAuthors.length === authors.length}
        onChange={(e) => setSelectedAuthors(e.target.checked ? authors : [])}
      >
        Select/Deselect All
      </Checkbox>
      <Divider />
      <CheckboxGroup value={selectedAuthors}>
        <Flex>
          {authors.map((author) => (
            <Checkbox
              key={author}
              value={author}
              onChange={(e) =>
                setSelectedAuthors(
                  e.target.checked
                    ? [...selectedAuthors, author]
                    : selectedAuthors.filter((a) => a !== author)
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
        <Text mb={5}>{shownFileCommits.length} files:</Text>
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
                    fontWeight={selectedAuthors.includes(author) ? 'bold' : 'normal'}
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
                    bgColor={selectedAuthors.includes(author) ? stringToColour(author) : 'grey'}
                  />
                ))}
              </Box>
            </Box>
          ))}
      </Box>
    </>
  );
};

export default FileCommits;
