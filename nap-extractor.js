const fs = require('fs'),
  { JSDOM } = require('jsdom');

const STREET_NUM_RE = /(\d{1,6})|One|Two|Three/,
  STREET_CITY_RE = /.{2,60}/,
  STATE_LIST = fs.readFileSync('states.dat', {encoding: 'utf8'}),
  STATE_RE = new RegExp(`(${STATE_LIST.split('\n').join('|')})`),
  ZIP_RE = /\d{5}(-\d{4})?/,
  ADDRESS_PATTERN = new RegExp(`(${STREET_NUM_RE.source}) ` +
    `(${STREET_CITY_RE.source}),? (${STATE_RE.source})( ${ZIP_RE.source})?`,
    'g');

const URL = process.argv[2];
if (!URL) throw 'missing required parameter: URL';

const decodeHTMLEntities = content => {
  return new JSDOM(content).window.document.querySelector('body').textContent;
};

const getContent = dom => {
  let document = dom.window.document;
  document.querySelectorAll('script,svg').forEach(el => el.remove());
  return decodeHTMLEntities(document.querySelector('body').innerHTML
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
};

JSDOM.fromURL(URL).then(dom => {
  const content = getContent(dom);
  const addresses = content.match(ADDRESS_PATTERN);
  addresses.forEach(a => console.log(a));
  process.exit(0);
}).catch(err => {
  console.log(err);
  process.exit(1);
});
