export function format_game_time(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  if (seconds === "60") {
    minutes += 1;
    seconds = "0";
  }
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
}

export function default_query() {
  return '?include_ladder_ids=3&include_map_ids=9&'
}

// Generate all combinations of array elements:
//https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
export function* cartesian(head, ...tail) {
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (let r of remainder) for (let h of head) yield [h, ...r];
}
