import wtf from 'wtf_wikipedia';
import { uniqBy, sortBy, zip, unzip } from 'lodash';

interface Template {
  json(): object
  text(): string
  wikitext(): string
}

interface TeamOpponentTempl {
  key: string,
  score: string,
  template: 'teamopponent',
}

interface MatchTempl {
  opponent1: string,
  opponent2: string,
  template: 'match',
}

export async function getDoubleElim(event: string, bracketSection: number): Promise<FormatInitializer> {
  const APIBaseURL = 'https://liquipedia.net/rocketleague/api.php?'
  const headers = new Headers({
    'User-Agent': 'bracket-rl/1.0 (http://bracket-rl.vercel.app/; lasse.moeldrup@gmail.com)',
    'Accept-Encoding': 'gzip',
  });
  const bracketRequestURL = APIBaseURL + new URLSearchParams({
    'action': 'parse',
    'format': 'json',
    'page': event,
    'prop': 'wikitext',
    'section': bracketSection.toString(),
    'formatversion': '2',
  });
  const rawBracketResponse = await fetch(bracketRequestURL, {
    headers
  });

  if (!rawBracketResponse.ok) {
    throw 'Failed to get bracket';
  }

  const data = JSON.parse(await rawBracketResponse.text());
  const section = wtf(data.parse.wikitext, {
    templateFallbackFn: parseTeamOpponent
  }).section('Results');
  if (!section)
    throw 'Unable to get Results section';

  const teamKeys = (section.templates('teamopponent') as Template[])
    .slice(0, 16)
    .map(t => (t.json() as TeamOpponentTempl).key);

  const teamRequestURL = APIBaseURL + new URLSearchParams({
    'action': 'expandtemplates',
    'format': 'json',
    'text': teamKeys.map(t => `{{teamBracket|${t}}}`).join(''),
    'prop': 'wikitext',
    'formatversion': '2',
  });
  const rawTeamResponse = await fetch(teamRequestURL, {
    headers
  });

  if (!rawTeamResponse.ok)
    throw 'Failed to get teams';

  const teamData = JSON.parse(await rawTeamResponse.text());
  const imageList = wtf(teamData.expandtemplates.wikitext).images();
  const sortedImages = sortBy(imageList, im => im.file().includes('lightmode'));
  const [teamNames, imageURLs] = unzip(uniqBy(sortedImages, im => im.caption())
    .map(im => [im.caption(), im.url().replace('wikipedia.org/wiki', 'liquipedia.net/rocketleague')]));
  if (teamNames.length !== imageURLs.length)
    throw 'Mismatch between teamNames and imageURLs';

  const teams = zip(teamNames, imageURLs).map(([name, image]) => ({
    name: name as string,
    image: image as string,
  }));
  const matchScores = (section.templates('match') as Template[]).map(m => {
    const obj = m.json() as MatchTempl;
    let score1 = obj.opponent1 && obj.opponent1.split('~')[1];
    let score2 = obj.opponent2 && obj.opponent2.split('~')[1];
    // Return a score of 100 if match was forfeit, this will get clamped to the match max
    return [
      score1 === 'W' ? 100 : (score1 === 'FF' ? null : parseInt(score1)),
      score2 === 'W' ? 100 : (score2 === 'FF' ? null : parseInt(score2)),
    ] as MatchScore;
  });

  return {
    teams,
    matchScores
  };
}

function parseTeamOpponent(tmpl: string, list: object[], parse: (tmpl: string) => object) {
  const obj = parse(tmpl) as any;

  if (tmpl.startsWith('{{TeamOpponent')) {
    const parsed = {
      key: obj.list[0],
      // The last bit is a hack, since missing score and 'FF' are treated the same
      score: obj.score || 'FF',
      template: 'teamopponent',
    };
    list.push(parsed);
    return `${parsed.key}~${parsed.score}`;
  }

  list.push(obj);
  return '[unsupported template]';
}
