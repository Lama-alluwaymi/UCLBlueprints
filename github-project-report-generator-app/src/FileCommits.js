import React, { useState } from 'react';
import { Box, Flex, Heading, Link, Text, Divider, Avatar, Switch } from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/react';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

import stringToColour from './stringToColour';

const FileCommits = ({
  fileCommits,
  authors,
  firstCommitDate,
  lastCommitDate,
  url,
  mostRecentCommitSha,
}) => {
  const [sortType, setSortType] = useState('Default');

  const [selectedAuthors, setSelectedAuthors] = useState(authors);

  const [onlyShowAuthorFiles, setOnlyShowAuthorFiles] = useState(false);
  const [onlyShowTogetherFiles, setOnlyShowTogetherFiles] = useState(false);

  const [timelineView, setTimelineView] = useState(false);
  const [showTimelineCommits, setShowTimelineCommits] = useState(false);

  const [proportionalBarHeights, setProportionalBarHeights] = useState(false);
  const [commitsInOrder, setCommitsInOrder] = useState(false);

  const [showFiles, setShowFiles] = useState(true);
  const [showFolders, setShowFolders] = useState(true);

  const totalTime = Math.abs(new Date(lastCommitDate) - new Date(firstCommitDate));

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
      <Flex align='center' my={5} wrap='wrap'>
        <Heading size='md' mr={5}>
          File Commits
        </Heading>
        <RadioGroup onChange={setSortType} value={sortType}>
          <Flex wrap='wrap'>
            <Text mr={2}>Sort by:</Text>
            <Radio value='Default' mr={2}>
              Repository Structure
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
        <Flex wrap='wrap'>
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

      <Flex mt={5} wrap='wrap'>
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

      <Flex mt={5} wrap='wrap'>
        <Text mr={2}>Timeline View:</Text>
        <Switch
          isChecked={timelineView}
          onChange={(e) => setTimelineView(e.target.checked)}
          mr={2}
        />
        {timelineView && (
          <>
            <Text mr={2}>Show Commits:</Text>
            <Switch
              isChecked={showTimelineCommits}
              onChange={(e) => setShowTimelineCommits(e.target.checked)}
              mr={2}
            />
          </>
        )}
      </Flex>

      {!timelineView && (
        <Flex mt={5} wrap='wrap'>
          <Checkbox
            isChecked={proportionalBarHeights}
            onChange={(e) => setProportionalBarHeights(e.target.checked)}
            mr={4}
          >
            Show Bar Heights Proportional to Commit Count
          </Checkbox>
          <Checkbox
            isChecked={commitsInOrder}
            onChange={(e) => setCommitsInOrder(e.target.checked)}
          >
            Show Commits in Order (from least recent on the left to most recent on the right)
          </Checkbox>
        </Flex>
      )}

      <Flex mt={5} wrap='wrap'>
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
        {timelineView && (
          <Flex justify='space-between' mb={5}>
            <Text>| {new Date(firstCommitDate).toLocaleDateString()}</Text>
            <Text>{new Date(lastCommitDate).toLocaleDateString()} |</Text>
          </Flex>
        )}
        {[...shownFileCommits]
          .sort((a, b) => (sortType === 'Default' ? 0 : b[1].commits - a[1].commits))
          .map(
            ([
              file,
              {
                authors,
                commits: totalCommits,
                order,
                firstCommitDate: first,
                lastCommitDate: last,
              },
            ]) => (
              <Box key={file} mb={8}>
                <Link href={`${url}/blob/${mostRecentCommitSha}/${file}`} isExternal>
                  {file}
                </Link>
                {` - ${totalCommits} commit${totalCommits > 1 ? 's' : ''} ${
                  timelineView
                    ? `from ${new Date(first).toLocaleDateString()} to ${new Date(
                        last
                      ).toLocaleDateString()}`
                    : ''
                } by: `}
                <Flex wrap='wrap' mb={2}>
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
                {!timelineView ? (
                  <Box
                    width='100%'
                    height={proportionalBarHeights ? `${totalCommits * 2}px` : 2}
                    mt={4}
                  >
                    {commitsInOrder
                      ? order.map(({ author }, index) => (
                          <Box
                            key={index}
                            width={`${(1 / totalCommits) * 100}%`}
                            height='100%'
                            float='left'
                            bgColor={
                              selectedAuthors.includes(author) ? stringToColour(author) : 'grey'
                            }
                          />
                        ))
                      : Object.entries(authors).map(([author, commits]) => (
                          <Box
                            key={author}
                            width={`${(commits / totalCommits) * 100}%`}
                            height='100%'
                            float='left'
                            bgColor={
                              selectedAuthors.includes(author) ? stringToColour(author) : 'grey'
                            }
                          />
                        ))}
                    {}
                  </Box>
                ) : (
                  <Box width={showTimelineCommits ? '99%' : '100%'} height={2} mt={4}>
                    <Box
                      float='left'
                      height='100%'
                      width={`${
                        (Math.abs(new Date(first) - new Date(firstCommitDate)) / totalTime) * 100
                      }%`}
                    />
                    <Flex
                      position='relative'
                      height='100%'
                      bgColor='black'
                      width={`${(Math.abs(new Date(last) - new Date(first)) / totalTime) * 100}%`}
                      align='center'
                    >
                      {showTimelineCommits &&
                        order.map(({ author, date }) => (
                          <Avatar
                            key={date}
                            name={author}
                            size='xs'
                            bgColor={
                              selectedAuthors.includes(author) ? stringToColour(author) : 'grey'
                            }
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
                )}
              </Box>
            )
          )}
      </Box>
    </>
  );
};

export default FileCommits;
