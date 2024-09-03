import 'server-only';

import {
  get2024Swiss,
  get2024WorldsPlayoffs,
  getWildcard,
  getWorldsMainEvent,
} from 'libs/liquipedia';
import Worlds from 'components/formats/worlds';
import { notFound } from 'next/navigation';
import Worlds2024 from 'components/formats/worlds2024';

export default async function WorldsEvent({
  params: { season },
}: {
  params: { season: string };
}) {
  let event_string = `Rocket_League_Championship_Series/${season}`;
  if (season === '2021-22' || season === '2022-23') {
    const worldsProps = {
      wildcardInit: await getWildcard(event_string),
      mainInit: await getWorldsMainEvent(event_string),
    };

    return <Worlds {...worldsProps} />;
  } else if (season === '2024') {
    const worldsProps = {
      swissInit: await get2024Swiss(event_string),
      playoffsInit: await get2024WorldsPlayoffs(event_string),
    };
    console.log(worldsProps);
    return <Worlds2024 {...worldsProps} />;
  } else {
    return notFound();
  }
}
