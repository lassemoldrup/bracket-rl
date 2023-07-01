import wtf from 'wtf_wikipedia';
import { chunk } from 'lodash';
import fs from 'fs/promises';

export async function getLatestBracket() {
  const event = 'Rocket_League_Championship_Series%2F2022-23%2FSpring';
  const bracketSection = 13;
  const headers = new Headers({
    'User-Agent': 'BracketRL/1.0 (lasse.moeldrup@gmail.com)',
    'Accept-Encoding': 'gzip',
  });
  // const rawBracketResponse = await fetch(`https://liquipedia.net/rocketleague/api.php?action=parse&format=json&page=${event}&prop=wikitext%7Cimages&section=${bracketSection}`, {
  //   headers
  // });

  // if (rawBracketResponse.ok) {
  if (true) {
    // const data = JSON.parse(await rawBracketResponse.text());
    const data = JSON.parse(await fs.readFile('data.txt', { encoding: 'utf8' }));
    console.log(data.parse.images);
    const section = wtf(data.parse.wikitext['*']).section('Results');
    const teams = section.templates('teamopponent').map(t => t.json().list[0]);
    const matches = chunk(teams, 2);
    console.log(matches);
  } else {
    // TODO
  }
  return {};
}