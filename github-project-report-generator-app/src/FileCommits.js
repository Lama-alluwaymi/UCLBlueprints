import React, { useState } from 'react';
import { Box, Flex, Heading, Link, Text, Divider, Avatar, Switch, Tooltip } from '@chakra-ui/react';
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

  const [showFiles, setShowFiles] = useState(true);
  const [showFolders, setShowFolders] = useState(true);

  const [timelineView, setTimelineView] = useState(false);
  const [showTimelineCommits, setShowTimelineCommits] = useState(false);

  const [proportionalBarHeights, setProportionalBarHeights] = useState(false);
  const [proportionalBarWidths, setProportionalBarWidths] = useState(false);
  const [commitsInOrder, setCommitsInOrder] = useState(false);

  const totalTime = Math.abs(new Date(lastCommitDate) - new Date(firstCommitDate));

  const shownFileCommits = fileCommits
    .filter((file) => {
      // Better to have these old school if-statements than confusing nested ternaries
      if (onlyShowTogetherFiles)
        return (
          selectedAuthors.length > 0 && selectedAuthors.every((author) => file[1].authors[author])
        );
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
  const maxCommits = shownFileCommits.reduce((a, file) => Math.max(a, file[1].commits), 0);

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
        <Text mr={2}>Only Show Files Selected Authors Worked On:</Text>
        <Switch
          isChecked={onlyShowAuthorFiles || onlyShowTogetherFiles}
          onChange={(e) => setOnlyShowAuthorFiles(e.target.checked)}
          isDisabled={onlyShowTogetherFiles}
          mr={4}
        />
        <Text mr={2}>Only Show Files All Selected Authors Worked On Together:</Text>
        <Switch
          isChecked={onlyShowTogetherFiles}
          onChange={(e) => setOnlyShowTogetherFiles(e.target.checked)}
        />
      </Flex>

      <Flex mt={5} wrap='wrap'>
        <Text mr={2}>Show Files:</Text>
        <Switch isChecked={showFiles} onChange={(e) => setShowFiles(e.target.checked)} mr={4} />
        <Text mr={2}>Show Folders:</Text>
        <Switch isChecked={showFolders} onChange={(e) => setShowFolders(e.target.checked)} />
      </Flex>

      <Flex mt={5} wrap='wrap'>
        <Text mr={2}>Timeline View:</Text>
        <Switch
          isChecked={timelineView}
          onChange={(e) => setTimelineView(e.target.checked)}
          mr={4}
        />
        {timelineView && (
          <>
            <Text mr={2}>Show Commits:</Text>
            <Switch
              isChecked={showTimelineCommits}
              onChange={(e) => setShowTimelineCommits(e.target.checked)}
            />
          </>
        )}
      </Flex>

      {!timelineView && (
        <Flex mt={5} wrap='wrap'>
          <Text mr={2}>Show Bar Heights Proportional to Commit Count:</Text>
          <Switch
            isChecked={proportionalBarHeights}
            onChange={(e) => setProportionalBarHeights(e.target.checked)}
            mr={4}
          />
          <Text mr={2}>Show Bar Widths Proportional to Commit Count:</Text>
          <Switch
            isChecked={proportionalBarWidths}
            onChange={(e) => setProportionalBarWidths(e.target.checked)}
            mr={4}
          />
          <Text mr={2}>Show Commits in Order from Least Recent to Most Recent:</Text>
          <Switch
            isChecked={commitsInOrder}
            onChange={(e) => setCommitsInOrder(e.target.checked)}
          />
        </Flex>
      )}

      <Box mt={5}>
        {timelineView && (
          <Flex justify='space-between' mb={5}>
            <Text>| {new Date(firstCommitDate).toLocaleDateString()}</Text>
            <Text>{new Date(lastCommitDate).toLocaleDateString()} |</Text>
          </Flex>
        )}
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
                {' - '}
                <Link href={`${url}/commits/${mostRecentCommitSha}/${file}`} isExternal>
                  {`${totalCommits} commit${totalCommits > 1 ? 's' : ''} ${
                    timelineView
                      ? new Date(first).toLocaleDateString() !== new Date(last).toLocaleDateString()
                        ? `from ${new Date(first).toLocaleDateString()} to ${new Date(
                            last
                          ).toLocaleDateString()}`
                        : `on ${new Date(first).toLocaleDateString()}`
                      : ''
                  }`}
                </Link>
                {' by: '}
                <Flex wrap='wrap' mb={2}>
                  {Object.entries(authors).map(([author, commits], index) => (
                    <Link
                      key={author}
                      href={`${url}/commits/${mostRecentCommitSha}/${file}?author=${author}`}
                      isExternal
                    >
                      <Text
                        color={selectedAuthors.includes(author) ? stringToColour(author) : 'grey'}
                        fontWeight={selectedAuthors.includes(author) ? 'bold' : 'normal'}
                        mr={2}
                      >
                        {author} ({commits}){index !== Object.keys(authors).length - 1 ? ',' : ''}
                      </Text>
                    </Link>
                  ))}
                </Flex>
                {/* https://stackoverflow.com/a/49828563 */}
                {!timelineView ? (
                  <Box
                    width={proportionalBarWidths ? `${(totalCommits / maxCommits) * 100}%` : '100%'}
                    height={proportionalBarHeights ? `${totalCommits * 2}px` : 3}
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
                  <Box width='100%' height={3} mt={4} position='relative'>
                    <Box
                      float='left'
                      height='100%'
                      width={`${
                        (Math.abs(new Date(first) - new Date(firstCommitDate)) / totalTime) * 100
                      }%`}
                    />
                    <Box
                      float='left'
                      height='100%'
                      bgColor='black'
                      width={`${(Math.abs(new Date(last) - new Date(first)) / totalTime) * 100}%`}
                    />
                    {showTimelineCommits &&
                      order.map(({ author, date, message, html_url }) => (
                        <Link key={date} href={html_url} isExternal>
                          <Tooltip
                            label={`"${message}" - ${author} committed on ${new Date(
                              date
                            ).toLocaleDateString()}`}
                            hasArrow
                          >
                            <Avatar
                              name={author}
                              size='xs'
                              bgColor={
                                selectedAuthors.includes(author) ? stringToColour(author) : 'grey'
                              }
                              position='absolute'
                              left={`calc(${
                                (Math.abs(new Date(date) - new Date(firstCommitDate)) / totalTime) *
                                100
                              }% - 10px)`}
                              top='-7px'
                            />
                          </Tooltip>
                        </Link>
                      ))}
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
