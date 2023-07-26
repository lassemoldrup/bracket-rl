import 'server-only';

import { getWildcard, getWorldsMainEvent } from 'libs/liquipedia';
import Worlds from 'components/formats/worlds';

export default async function WorldsEvent({
  params: { season },
}: {
  params: { season: string };
}) {
  let event_string = `Rocket_League_Championship_Series/${season}`;
  if (season !== '2021-22' && season !== '2022-23')
    // TODO: Throw 404 somehow
    throw new Error('Unsupported worlds season');

  const worldsProps = {
    wildcardInit: await getWildcard(event_string),
    mainInit: await getWorldsMainEvent(event_string),
  };

  return <Worlds {...worldsProps} />;
}
