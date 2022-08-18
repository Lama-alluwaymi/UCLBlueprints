const fs = require('fs');
require('dotenv').config();

const generateReport = require('./src/generateReport');

(async () => {
  fs.writeFileSync(
    'src/sampleData.json',
    JSON.stringify(
      await generateReport(process.env.GITHUB_TOKEN, {
        owner: 'ArchawinWongkittiruk',
        repo: 'TheBackrowers',
      }),
      null,
      2
    )
  );
})();
