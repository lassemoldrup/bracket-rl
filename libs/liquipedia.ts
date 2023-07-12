import wtf from 'wtf_wikipedia';
import { uniqBy, sortBy, zip, unzip } from 'lodash';

const bracketRLVersion = '1.0';
const userAgent = `bracket-rl/${bracketRLVersion} (http://bracket-rl.vercel.app/; lasse.moeldrup@gmail.com)`;

interface TeamOpponent {
  key: string,
  score: number | null,
}

interface Match {
  opponent1: TeamOpponent,
  opponent2: TeamOpponent,
}

// Types from wtf_wikipedia
type WTFDocument = ReturnType<typeof wtf>;
type WTFSection = Exclude<ReturnType<WTFDocument['section']>, null>;
interface WTFTemplate {
  json(): object
  text(): string
  wikitext(): string
}

export async function getDoubleElim(event: string): Promise<FormatInitializer> {
  const section = await getResultsSection(event);
  const teams = await getTeams(section, 16);

  const matchScores = (section.templates('match') as WTFTemplate[]).map(m => {
    const match = m.json() as Match;
    return [
      match.opponent1.score,
      match.opponent2.score,
    ] as MatchScore;
  });

  return {
    teams,
    matchScores
  };
}

async function getResultsSection(event: string): Promise<WTFSection> {
  const doc = await wtf.extend(extendTemplates).fetch(event, {
    domain: 'liquipedia.net/rocketleague',
    'Api-User-Agent': userAgent,
  });
  if (!doc)
    throw 'Failed to get event';

  const section = (doc as WTFDocument).section('Results');
  if (!section)
    throw 'Failed to get Results section';

  return section;
}

function extendTemplates(_models: any, templates: any): void {
  templates.teamopponent = (tmpl: string, list: object[], parse: (tmpl: string) => any) => {
    const obj = parse(tmpl);
    // Return a score of 100 if match was forfeit, this will get clamped to the match max
    let score: number | null = obj.score === 'W' ? 100 : parseInt(obj.score);
    // if score is NaN
    if (score !== score)
      score = null;
    const parsed = {
      key: obj.list[0],
      score,
      template: 'teamopponent',
    };
    list.push(parsed);
    return JSON.stringify(parsed);
  };

  templates.match = (tmpl: string, list: object[], parse: (tmpl: string) => any) => {
    let obj = parse(tmpl);
    const parsed = {
      opponent1: JSON.parse(obj.opponent1),
      opponent2: JSON.parse(obj.opponent2),
      template: 'match',
    }
    list.push(parsed);
    return JSON.stringify(parsed);
  }
}

async function getTeams(section: WTFSection, numTeams: number): Promise<Team[]> {
  const teamKeys = (section.templates('teamopponent') as WTFTemplate[])
    .slice(0, numTeams)
    .map(t => (t.json() as TeamOpponent).key);

  // Get team images and names
  const APIBaseURL = 'https://liquipedia.net/rocketleague/api.php?'
  const teamRequestURL = APIBaseURL + new URLSearchParams({
    'action': 'expandtemplates',
    'format': 'json',
    'text': teamKeys.map(t => `{{teamBracket|${t}}}`).join(''),
    'prop': 'wikitext',
    'formatversion': '2',
  });
  const headers = new Headers({
    'User-Agent': userAgent,
    'Api-User-Agent': userAgent,
    'Accept-Encoding': 'gzip',
  });
  const rawTeamResponse = await fetch(teamRequestURL, { headers });
  if (!rawTeamResponse.ok)
    throw `Failed to get teams: status code ${rawTeamResponse.status}.`;

  const teamData = JSON.parse(await rawTeamResponse.text());
  if (teamData.error) {
    if (teamData.error.info)
      throw 'Failed to get teams: ' + teamData.error.info;
    else
      throw 'Failed to get teams.';
  }

  const imageList = wtf(teamData.expandtemplates.wikitext).images();
  // Deprioritizes images that have lightmode in the name
  const sortedImages = sortBy(imageList, im => im.file().includes('lightmode'));
  const [teamNames, imageURLs] = unzip(uniqBy(sortedImages, im => im.caption())
    .map(im => [im.caption(), im.url().replace('wikipedia.org/wiki', 'liquipedia.net/rocketleague')]));
  if (teamNames.length !== imageURLs.length)
    throw 'Mismatch between teamNames and imageURLs';

  return zip(teamNames, imageURLs).map(([name, image]) => ({
    name: name as string,
    image: image as string,
  }));
}