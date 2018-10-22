const { JSDOM } = require('jsdom');

const STREET_NUM_RE = /(\d{1,6})|One|Two|Three/,
  STREET_CITY_RE = /.{2,60}/,
  STATE_RE = /WA|Washington|Wash.?/, // TODO all states
  ZIP_RE = /\d{5}(-\d{4})?/,
  ADDRESS_PATTERN = new RegExp(`(${STREET_NUM_RE.source}) ` +
    `(${STREET_CITY_RE.source}), (${STATE_RE.source})( ${ZIP_RE.source})?`,
    'g');

const URL = process.argv[2];
if (!URL) throw 'missing required parameter: URL';

const getContent = dom => {
  let document = dom.window.document;
  document.querySelectorAll('script,svg').forEach(el => el.remove());
  return document.querySelector('body').innerHTML
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace('&amp;', '&')
    .replace('&nbsp;', ' '); //TODO there is probably a clean parse to do this
};

const getNAPs = content => {
  return content.match(ADDRESS_PATTERN);
};

JSDOM.fromURL(URL).then(dom => {
  const content = getContent(dom);
  const naps = getNAPs(content);
  console.dir(naps);
  process.exit(0);
}).catch(err => {
  console.log(err);
  process.exit(1);
});
