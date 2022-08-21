import React, { useState } from 'react';
import { Box, Flex, Heading, Link, Text, Divider } from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

import stringToColour from './stringToColour';

const FileCommits = ({ fileCommits, authors, url, mostRecentCommitSha }) => {
  const [sortType, setSortType] = useState('Default');
  const [selectedAuthors, setSelectedAuthors] = useState(authors);
  const [onlyShowAuthorFiles, setOnlyShowAuthorFiles] = useState(false);
  const [onlyShowTogetherFiles, setOnlyShowTogetherFiles] = useState(false);
  const [proportionalBarHeights, setProportionalBarHeights] = useState(false);
  const [commitsInOrder, setCommitsInOrder] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const [showFolders, setShowFolders] = useState(true);
  const shownFileCommits = fileCommits
    .filter((file) => {
      // Better to have these old school if-statements than confusing nested ternaries
      if (Object.keys(file[1].authors).length === 0) return false;
      if (onlyShowTogetherFiles)
        return selectedAuthors.length > 0
          ? selectedAuthors.every((author) => file[1].authors[author])
          : false;
      if (onlyShowAuthorFiles) return selectedAuthors.some((author) => file[1].authors[author]);
      return true;
    })
    .filter((file) => {
      if (showFiles && file[0].includes('.')) return true;
      if (showFolders && !file[0].includes('.')) return true;
      return false;
    });
  const highlightedFileCommits = fileCommits.filter(
    (file) =>
      selectedAuthors.some((author) => file[1].authors[author]) &&
      shownFileCommits.some((shownFile) => shownFile[0] === file[0])
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
        mr={4}
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

      <Flex mt={5}>
        <Checkbox
          isChecked={onlyShowAuthorFiles || onlyShowTogetherFiles}
          onChange={(e) => setOnlyShowAuthorFiles(e.target.checked)}
          isDisabled={onlyShowTogetherFiles}
          mr={4}
        >
          Only Show Files Selected Authors Worked On
        </Checkbox>
        <Checkbox
          isChecked={onlyShowTogetherFiles}
          onChange={(e) => setOnlyShowTogetherFiles(e.target.checked)}
        >
          Only Show Files All Selected Authors Worked On Together
        </Checkbox>
      </Flex>

      <Flex mt={5}>
        <Checkbox
          isChecked={proportionalBarHeights}
          onChange={(e) => setProportionalBarHeights(e.target.checked)}
          mr={4}
        >
          Show Bar Heights Proportional to Commit Count
        </Checkbox>
        <Checkbox isChecked={commitsInOrder} onChange={(e) => setCommitsInOrder(e.target.checked)}>
          Show Commits in Order (from most recent on the left to least recent on the right)
        </Checkbox>
      </Flex>

      <Flex mt={5}>
        <Checkbox isChecked={showFiles} onChange={(e) => setShowFiles(e.target.checked)} mr={4}>
          Show Files
        </Checkbox>
        <Checkbox isChecked={showFolders} onChange={(e) => setShowFolders(e.target.checked)}>
          Show Folders
        </Checkbox>
      </Flex>

      <Box mt={5}>
        <Text mb={5}>
          {!onlyShowAuthorFiles && !onlyShowTogetherFiles
            ? `${highlightedFileCommits.length}/`
            : ''}
          {shownFileCommits.length} {showFiles ? 'files' : ''}
          {showFiles && showFolders ? ' and ' : ''}
          {showFolders ? 'folders' : ''}
          {!onlyShowAuthorFiles && !onlyShowTogetherFiles ? ' highlighted' : ''}:
        </Text>
        {[...shownFileCommits]
          .sort((a, b) => (sortType === 'Default' ? 0 : b[1].commits - a[1].commits))
          .map(([file, { authors, commits: totalCommits, order }]) => (
            <Box key={file} mb={4}>
              <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal>
                {file}
              </Link>
              {` - ${totalCommits} commit${totalCommits > 1 ? 's' : ''} by: `}
              <Flex mb={2}>
                {Object.entries(authors).map(([author, commits]) => (
                  <Text
                    key={author}
                    color={selectedAuthors.includes(author) ? stringToColour(author) : 'grey'}
                    fontWeight={selectedAuthors.includes(author) ? 'bold' : 'normal'}
                    mr={2}
                  >
                    {author} ({commits}),
                  </Text>
                ))}
              </Flex>
              {/* https://stackoverflow.com/a/49828563 */}
              <Box width='100%' height={proportionalBarHeights ? `${totalCommits * 2}px` : 2}>
                {commitsInOrder
                  ? order.map((author, index) => (
                      <Box
                        key={index}
                        width={`${(1 / totalCommits) * 100}%`}
                        height='100%'
                        float='left'
                        bgColor={selectedAuthors.includes(author) ? stringToColour(author) : 'grey'}
                      />
                    ))
                  : Object.entries(authors).map(([author, commits]) => (
                      <Box
                        key={author}
                        width={`${(commits / totalCommits) * 100}%`}
                        height='100%'
                        float='left'
                        bgColor={selectedAuthors.includes(author) ? stringToColour(author) : 'grey'}
                      />
                    ))}
                {}
              </Box>
            </Box>
          ))}
      </Box>
    </>
  );
};

export default FileCommits;
