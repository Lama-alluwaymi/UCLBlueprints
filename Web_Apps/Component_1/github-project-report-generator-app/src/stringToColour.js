// https://stackoverflow.com/a/66494926
function stringToColour(stringInput) {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
}

export default stringToColour;
