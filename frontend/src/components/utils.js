export function format_game_time(millis) {
  let minutes = Math.floor(millis / 60000);
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  if (seconds === '60') {
    minutes += 1;
    seconds = '0';
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function default_query() {
  return '?include_ladder_ids=3&include_map_ids=9&';
}

// Generate all combinations of array elements:
// https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
export function* cartesian(head, ...tail) {
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (const r of remainder) for (const h of head) yield [h, ...r];
}

// Convert numbers to english strings
// https://stackoverflow.com/a/20426113/6505507
const special = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

export function stringifyNumber(n) {
  if (n < 20) return special[n];
  if (n % 10 === 0) return `${deca[Math.floor(n / 10) - 2]}ieth`;
  return `${deca[Math.floor(n / 10) - 2]}y-${special[n % 10]}`;
}

export function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

export function formatArgumentsForMultiSelect(arg_array, info_array) {
  const ret_array = [];
  // TODO: Rewrite something more efficient - sort arg array and go through both only once
  for (const i of info_array) {
    for (const j of arg_array) {
      if (i.id == j) {
        ret_array.push(i);
      }
    }
  }
  return ret_array;
}
