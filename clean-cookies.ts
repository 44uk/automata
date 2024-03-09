import fs from 'fs';
import state from './state.json';

const WHITELIST_DOMAIN = `
websearch.rakuten.co.jp
grp02.id.rakuten.co.jp
`.split("\n");

const WHITELIST_DOMAIN_PATTERN = [
/rakuten\.co\.jp/,
/rakuten\.com/,
/dlsite\.com/,
/sbisec\.co\.jp/,
/sokmil\.com/,
];

const WHITELIST_ORIGIN_PATTERN = [
/rakuten\.co\.jp/,
/rakuten\.com/,
/dlsite\.com/,
/sbisec\.co\.jp/,
/sokmil\.com/,
];

const cookies = state['cookies'];
const origins = state['origins'];

const newCookies = cookies
  .filter(cookie => WHITELIST_DOMAIN_PATTERN.some(pattern => pattern.test(cookie.domain)))
  // .filter(cookie => WHITELIST_DOMAIN.includes(cookie.domain))
;

const newOrigins = origins
  .filter(origin => WHITELIST_ORIGIN_PATTERN.some(pattern => pattern.test(origin.origin)))
;

const newState = { cookies: newCookies, origins: newOrigins };

fs.writeFileSync('state.json', JSON.stringify(newState, null, 2), {
  flag: 'w'
});
