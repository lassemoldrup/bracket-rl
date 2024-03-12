import wtf from 'wtf_wikipedia';
import _, { get } from 'lodash';
import { cache } from 'react';
import eventOverrides from 'data/event-overrides.json';
import {
  BracketInitializer,
  Matchup,
  MatchScore,
  Team,
  SwissInitializer,
  WorldsInitializer,
} from './types';
import assert from 'assert';
import manifest from '../package.json';

const userAgent = `bracket-rl/${manifest.version} (http://bracket-rl.vercel.app/; lasse.moeldrup@gmail.com)`;

const TEAM_OPPONENT = 'teamopponent';
interface TeamOpponent {
  key: string;
  score: number | null;
}

const MATCH = 'match';
interface Match {
  opponent1?: TeamOpponent;
  opponent2?: TeamOpponent;
}

type EventOverrides = { [event: string]: EventOverride };
interface EventOverride {
  seeding?: string[];
}

// Types from wtf_wikipedia
type WTFDocument = ReturnType<typeof wtf>;
type WTFSection = Exclude<ReturnType<WTFDocument['section']>, null>;
interface WTFTemplate<T> {
  json(): T;
  text(): string;
  wikitext(): string;
}

export const getDoubleElim = cache(async function (
  event: string
): Promise<BracketInitializer> {
  const section = await getSection(event, 'Results');
  const teamKeys = getFirstNTeams(section, 16);
  const teams = await getTeamsFromKeys(teamKeys);
  const matchups = _.chunk(teams, 2) as Matchup[];

  const matchScores = (section.templates(MATCH) as WTFTemplate<Match>[]).map(
    (m) => {
      const match = m.json();
      return [
        match.opponent1?.score ?? null,
        match.opponent2?.score ?? null,
      ] as MatchScore;
    }
  );

  return { matchups, matchScores };
});

export const getWildcard = cache(async function (
  event: string
): Promise<SwissInitializer> {
  const section = await getSection(`${event}/Wildcard`, 'Detailed Results');
  return await getSwissFromSection(event, section, 4);
});

export const get2024Swiss = cache(async function (
  event: string
): Promise<SwissInitializer> {
  const section = await getSection(event, 'Detailed Results');
  return await getSwissFromSection(event, section);
});

export const get2024Playoffs = cache(async function (
  event: string
): Promise<BracketInitializer> {
  const playoffsSection = await getSection(event, 'Playoffs');
  const matchScores = (playoffsSection.templates(MATCH) as WTFTemplate<Match>[])
    .map((m) => m.json())
    .map((m) => [
      m.opponent1?.score ?? null,
      m.opponent2?.score ?? null,
    ]) as MatchScore[];

  return { matchups: [], matchScores };
});

async function getSwissFromSection(
  event: string,
  section: WTFSection,
  winsNeeded: number = 3
): Promise<SwissInitializer> {
  const subSections = section.children();
  if (!subSections || !Array.isArray(subSections))
    throw new Error('Failed to get rounds');

  const overrides = eventOverrides as EventOverrides;
  const teamKeys =
    overrides[event]?.seeding ||
    _.sortBy(
      getFirstNTeams(section.children('Round 1') as WTFSection, 16),
      (_, i) => i % 2
    );

  const matchTeamOpponents = (subSections as WTFSection[])
    .flatMap((r) =>
      (r.templates(TEAM_OPPONENT) as WTFTemplate<TeamOpponent>[]).map((t) =>
        t.json()
      )
    )
    .filter((to) => to.key !== '');

  // There might be teams with multiple keys, so we convert everything
  // to rendered teams, which are unique per team
  const allMatchTeamKeys = _.uniq(
    teamKeys.concat(matchTeamOpponents.map((t) => t.key))
  );
  const allMatchTeams = await getTeamsFromKeys(allMatchTeamKeys);
  const teamMap = _.zipObject(allMatchTeamKeys, allMatchTeams);

  const teams = teamKeys.map((t) => teamMap[t]);
  const matchTeams = matchTeamOpponents.map((t) => teamMap[t.key]);

  const matchups = _.chunk(
    matchTeams.map((mt) => teams.findIndex((t) => t.name === mt.name)),
    2
  ) as [number, number][];
  const matchScores = _.chunk(
    matchTeamOpponents.map((t) => t.score),
    2
  ) as MatchScore[];
  return { teams, matchups, matchScores, winsNeeded };
}

export const getWorldsMainEvent = cache(async function (
  event: string
): Promise<WorldsInitializer> {
  const groupsSection = await getSection(`${event}/Group_Stage`, 'Results');
  const subSections = groupsSection.children();
  if (!subSections || !Array.isArray(subSections))
    throw new Error('Failed to get groups');

  const teamOpponentMatchups = subSections
    .flatMap((s) => s.templates(MATCH) as WTFTemplate<Match>[])
    .map((m) => m.json());

  const teamKeys = teamOpponentMatchups
    .slice(0, 4)
    .concat(teamOpponentMatchups.slice(10, 14))
    .map((m) => m.opponent1?.key);
  assert(teamKeys.every((t) => t));
  const teams = await getTeamsFromKeys(teamKeys as string[]);
  const matchups = teams.map((t) => [t, null]) as [Team, null][];

  const groupsScores = teamOpponentMatchups.map((m) => [
    m.opponent1?.score ?? null,
    m.opponent2?.score ?? null,
  ]) as MatchScore[];

  const playoffsSection = await getSection(`${event}/Playoffs`, 'Results');
  const playoffsScores = (
    playoffsSection.templates(MATCH) as WTFTemplate<Match>[]
  )
    .map((m) => m.json())
    .map((m) => [
      m.opponent1?.score ?? null,
      m.opponent2?.score ?? null,
    ]) as MatchScore[];

  const matchScores = groupsScores.concat(playoffsScores);

  return { matchups, matchScores };
});

async function getSection(
  event: string,
  sectionName: string
): Promise<WTFSection> {
  const doc = await wtf.extend(extendTemplates).fetch(event, {
    domain: 'liquipedia.net/rocketleague',
    'Api-User-Agent': userAgent,
  });
  if (!doc) throw 'Failed to get event';

  const section = (doc as WTFDocument).section(sectionName);
  if (!section) throw new Error(`Failed to get ${sectionName} section`);

  return section;
}

function extendTemplates(_models: any, templates: any): void {
  templates.teamopponent = (
    tmpl: string,
    list: object[],
    parse: (tmpl: string) => any
  ) => {
    const obj = parse(tmpl);
    // Return a score of 100 if match was forfeit, this will get clamped to the match max
    let score: number | null = obj.score === 'W' ? 100 : parseInt(obj.score);
    if (!obj.score) score = null;
    // if score is NaN e.g. 'FF'
    else if (score !== score) score = 0;
    const parsed = {
      key: obj.list[0].toLowerCase(),
      score,
      template: TEAM_OPPONENT,
    };
    list.push(parsed);
    return JSON.stringify(parsed);
  };

  templates.match = (
    tmpl: string,
    list: object[],
    parse: (tmpl: string) => any
  ) => {
    let obj = parse(tmpl);
    const parsed = {
      opponent1: obj.opponent1 && JSON.parse(obj.opponent1),
      opponent2: obj.opponent2 && JSON.parse(obj.opponent2),
      template: MATCH,
    };
    list.push(parsed);
    return JSON.stringify(parsed);
  };
}

function getFirstNTeams(section: WTFSection, n: number): string[] {
  return (section.templates(TEAM_OPPONENT) as WTFTemplate<TeamOpponent>[])
    .slice(0, n)
    .map((t) => t.json().key);
}

async function getTeamsFromKeys(teamKeys: string[]): Promise<Team[]> {
  // Get team images and names
  const APIBaseURL = 'https://liquipedia.net/rocketleague/api.php?';
  const teamRequestURL =
    APIBaseURL +
    new URLSearchParams({
      action: 'expandtemplates',
      format: 'json',
      text: teamKeys.map((t) => `{{teamBracket|${t}}}`).join(''),
      prop: 'wikitext',
      formatversion: '2',
    });
  const headers = new Headers({
    'User-Agent': userAgent,
    'Api-User-Agent': userAgent,
    'Accept-Encoding': 'gzip',
  });
  const rawTeamResponse = await fetch(teamRequestURL, { headers });
  if (!rawTeamResponse.ok)
    throw new Error(
      `Failed to get teams: status code ${rawTeamResponse.status}.`
    );

  const teamData = JSON.parse(await rawTeamResponse.text());
  if (teamData.error) {
    if (teamData.error.info)
      throw new Error('Failed to get teams: ' + teamData.error.info);
    else throw new Error('Failed to get teams.');
  }

  const imageList = wtf(teamData.expandtemplates.wikitext)
    .images()
    // Deprioritizes lightmode images
    .filter((_, i) => i % 2 === 1);

  const [teamNames, imageURLs] = _.unzip(
    imageList.map((im) => [
      im.caption(),
      im.url().replace('wikipedia.org/wiki', 'liquipedia.net/rocketleague'),
    ])
  );
  if (teamNames.length !== imageURLs.length)
    throw new Error('Mismatch between teamNames and imageURLs');

  return _.zip(teamNames, imageURLs).map(([name, image]) => ({
    name: name as string,
    image: image as string,
  }));
}
