import 'server-only';

import { getDoubleElim } from 'libs/liquipedia';
import Format from 'components/format';
import { FormatInitializer } from 'libs/types';

export const revalidate = 60;

export default async function Event({
  params,
}: {
  params: { event: string[] }
}) {
  let event_string = 'Rocket_League_Championship_Series/2022-23/Spring';
  if (params.event)
    event_string = params.event.join('/');

  let init: FormatInitializer;
  if (event_string.includes('/Spring')) {
    init = await getDoubleElim(event_string);
  } else {
    throw new Error('Unsupported event');
  }

  return (
    <Format init={init}></Format>
  );
}

// Other double elim events for testing:
// 'Rocket_League_Championship_Series/2022-23/Spring/Asia-Pacific/Open'
// 'Rocket_League_Championship_Series/2022-23/Spring/Europe/Cup';
