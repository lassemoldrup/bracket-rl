import 'server-only';

import { getDoubleElim } from 'libs/liquipedia';
import Format from 'components/format';

export default async function SpringEvent({
  params: {
    season,
    event,
  },
}: {
  params: { season: string, event?: string[] }
}) {
  let event_string = `Rocket_League_Championship_Series/${season}/Spring`;
  if (event)
    event_string = `${event_string}/${event.join('/')}`;

  return (
    <Format init={await getDoubleElim(event_string)}></Format>
  );
}

// Other double elim events for testing:
// 'Rocket_League_Championship_Series/2022-23/Spring/Asia-Pacific/Open'
// 'Rocket_League_Championship_Series/2022-23/Spring/Europe/Cup';
