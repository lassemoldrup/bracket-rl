import 'server-only';

import { getWildcard } from 'libs/liquipedia';
import Format from 'components/format';

export default async function Worlds({
  params: {
    season,
  },
}: {
  params: { season: string }
}) {
  let event_string = `Rocket_League_Championship_Series/${season}`;
  if (season !== '2021-22' && season !== '2022-23')
    // TODO: Throw 404 somehow
    throw new Error('Unsupported worlds season');

  return (
    <Format init={await getWildcard(event_string)}></Format>
  );
}