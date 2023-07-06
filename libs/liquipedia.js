import wtf from 'wtf_wikipedia';
import fs from 'fs/promises';

export async function getDoubleElim(event, bracketSection) {
  const APIBaseURL = 'https://liquipedia.net/rocketleague/api.php?'
  const headers = new Headers({
    'User-Agent': 'BracketRL/1.0 (lasse.moeldrup@gmail.com)',
    'Accept-Encoding': 'gzip',
  });
  // const bracketRequestUrl = APIBaseURL + new URLSearchParams({
  //   'action': 'parse',
  //   'format': 'json',
  //   'page': event,
  //   'prop': 'wikitext|images',
  //   'section': bracketSection,
  // });
  // const rawBracketResponse = await fetch(bracketRequestUrl, {
  //   headers
  // });

  // if (!rawBracketResponse.ok) {
  //   throw 'Failed to get bracket';
  // }

  // const data = JSON.parse(await rawBracketResponse.text());
  const data = JSON.parse(await fs.readFile('data.txt', { encoding: 'utf8' }));
  const imageNames = data.parse.images
    .filter(im => im.includes('allmode') || im.includes('darkmode'))
    .map(im => 'File:' + im);
  const imagesString = imageNames.join('|');

  const imagesRequestURL = APIBaseURL + new URLSearchParams({
    'action': 'query',
    'format': 'json',
    'prop': 'imageinfo',
    'titles': imagesString,
    'formatversion': 2,
    'iiprop': 'url',
    'iiurlheight': 50
  });
  const imagesResponse = await fetch(imagesRequestURL, { headers });

  if (!imagesResponse.ok) {
    throw 'Failed to get thumbnails';
  }

  const images = [];
  const imageData = JSON.parse(await imagesResponse.text());
  for (const im of imageData.query.pages) {
    images[imageNames.indexOf(im.title.replaceAll(' ', '_'))] = im.imageinfo[0].thumburl;
  }

  const section = wtf(data.parse.wikitext['*']).section('Results');
  const teams = section.templates('teamopponent')
    .map((t, i) => ({ team: t.json().list[0], image: images[i] }));

  return teams;
}