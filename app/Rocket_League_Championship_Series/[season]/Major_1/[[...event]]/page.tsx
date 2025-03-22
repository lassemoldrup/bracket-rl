import 'server-only';

import { get2024Playoffs, get2024Swiss } from 'libs/liquipedia';
import Format2024 from 'components/formats/format2024';

export default async function Major1Event({
  params,
}: {
  params: Promise<{ season: string; event?: string[] }>;
}) {
  const { season, event } = await params;
  let event_string = `Rocket_League_Championship_Series/${season}/Major_1`;
  if (event) event_string = `${event_string}/${event.join('/')}`;

  return (
    <Format2024
      swissInit={await get2024Swiss(event_string)}
      bracketInit={await get2024Playoffs(event_string)}
    />
  );
}
