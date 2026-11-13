// Read-only acceptance check. Run after a separately approved Cloudflare release.
// This does not create, update, deploy, or emulate a redirect.
import assert from 'node:assert/strict';

// Published by the old app (aoma23/aoma23.github.io, 351217d, index.html).
const legacyQuery = 'EwZwJg7gWgjANAVgNbKsRSBGAWKBmDAcwHspsMBbADigTioGNUA2ehnKAdjZKirepQAnHEwBTIQEdYABlHYAlsFjwAwgAcZkWHFXVU6PVQ4EjvckcF1VAK0Itddjt1uFe-V4JGqSU2bpIlFTgAIUhIIA';
const queries = [
  '',
  `?q=${legacyQuery}&utm_source=blog&utm_medium=article&utm_campaign=legacy-check`,
  '?q=%2B%24%2F%3D&tag=one&tag=two&empty=&label=%E6%88%A6%E8%A1%93',
];
const paths = ['/app/quickboard/', '/app/quickboard', '/app/quickboard/index.html'];
let failures = 0;

for (const path of paths) {
  for (const query of queries) {
    const source = `https://aoma23.com${path}${query}`;
    const target = `https://quickboard.aoma23.com/ja/${query}`;
    try {
      const response = await fetch(source, {
        method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000),
      });
      assert.equal(response.status, 301, 'Expected HTTP 301');
      assert.equal(response.headers.get('location'), target, 'Location must retain the entire query');
      console.log(`PASS ${source}`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${source}\n${error.message}`);
    }
  }
}

process.exitCode = failures ? 1 : 0;
