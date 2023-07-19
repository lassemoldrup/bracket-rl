import wtf from 'wtf_wikipedia';
import _ from 'lodash';
import { cache } from 'react';
import fs from 'fs/promises';
import { BracketInitializer, Matchup, MatchScore, FormatKind, Team, SwissInitializer } from './types';

const userAgent = `bracket-rl/1.0 (http://bracket-rl.vercel.app/; lasse.moeldrup@gmail.com)`;

const TEAM_OPPONENT = 'teamopponent';
interface TeamOpponent {
  key: string,
  score: number | null,
}

const MATCH = 'match';
interface Match {
  opponent1: TeamOpponent,
  opponent2: TeamOpponent,
}

type EventOverrides = { [event: string]: EventOverride };
interface EventOverride {
  seeding?: string[],
}

// Types from wtf_wikipedia
type WTFDocument = ReturnType<typeof wtf>;
type WTFSection = Exclude<ReturnType<WTFDocument['section']>, null>;
interface WTFTemplate<T> {
  json(): T
  text(): string
  wikitext(): string
}

export const getDoubleElim = cache(async (event: string): Promise<BracketInitializer> => {
  const section = await getSection(event, 'Results');
  const teamKeys = getFirstNTeams(section, 16);
  const teams = await getTeamsFromKeys(teamKeys);
  const matchups = _.chunk(teams, 2) as Matchup[];

  const matchScores = (section.templates(MATCH) as WTFTemplate<Match>[]).map(m => {
    const match = m.json();
    return [
      match.opponent1.score,
      match.opponent2.score,
    ] as MatchScore;
  });

  return { kind: FormatKind.DoubleElim, matchups, matchScores };
});

export const getWildcard = cache(async (event: string): Promise<SwissInitializer> => {
  const section = await getSection(`${event}/Wildcard`, 'Detailed Results');
  const subSections = section.children();
  if (!subSections || !Array.isArray(subSections))
    throw new Error('Failed to get rounds');

  const rawOverrides = await fs.readFile('data/event-overrides.json', { encoding: 'utf8' });
  const overrides = JSON.parse(rawOverrides) as EventOverrides;
  const teamKeys = overrides[event]?.seeding
    || getFirstNTeams(section.children('Round 1') as WTFSection, 16);
  const teams = await getTeamsFromKeys(teamKeys);
  const matchTeams = (subSections as WTFSection[]).flatMap(r =>
    (r.templates(TEAM_OPPONENT) as WTFTemplate<TeamOpponent>[]).map(t => t.json())
  );

  const matchups = _.chunk(matchTeams.map(t => teamKeys.indexOf(t.key)), 2) as [number, number][];
  const matchScores = _.chunk(matchTeams.map(t => t.score), 2) as MatchScore[];
  return { kind: FormatKind.Swiss, teams, matchups, matchScores, winsNeeded: 4 };
});

async function getSection(event: string, sectionName: string): Promise<WTFSection> {
  const doc = await wtf.extend(extendTemplates).fetch(event, {
    domain: 'liquipedia.net/rocketleague',
    'Api-User-Agent': userAgent,
  });
  if (!doc)
    throw 'Failed to get event';

  const section = (doc as WTFDocument).section(sectionName);
  if (!section)
    throw `Failed to get ${sectionName} section`;

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
      template: TEAM_OPPONENT,
    };
    list.push(parsed);
    return JSON.stringify(parsed);
  };

  templates.match = (tmpl: string, list: object[], parse: (tmpl: string) => any) => {
    let obj = parse(tmpl);
    const parsed = {
      opponent1: JSON.parse(obj.opponent1),
      opponent2: JSON.parse(obj.opponent2),
      template: MATCH,
    }
    list.push(parsed);
    return JSON.stringify(parsed);
  }
}

function getFirstNTeams(section: WTFSection, n: number): string[] {
  return (section.templates(TEAM_OPPONENT) as WTFTemplate<TeamOpponent>[])
    .slice(0, n)
    .map(t => t.json().key);
}

async function getTeamsFromKeys(teamKeys: string[]): Promise<Team[]> {
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
  const sortedImages = _.sortBy(imageList, im => im.file().includes('lightmode'));
  const [teamNames, imageURLs] = _.unzip(
    _.uniqBy(sortedImages, im => im.caption())
      .map(im => [
        im.caption(),
        im.url().replace('wikipedia.org/wiki', 'liquipedia.net/rocketleague'),
      ])
  );
  if (teamNames.length !== imageURLs.length)
    throw 'Mismatch between teamNames and imageURLs';

  return _.zip(teamNames, imageURLs).map(([name, image]) => ({
    name: name as string,
    image: image as string,
  }));
}