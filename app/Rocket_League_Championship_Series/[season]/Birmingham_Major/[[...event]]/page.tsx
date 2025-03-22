import 'server-only';

import { get2025Swiss, getAFLPlayoffs } from 'libs/liquipedia';
import { notFound } from 'next/navigation';
import SwissIntoAFL from 'components/formats/swissIntoAFL';

export default async function BirminghamMajorEvent({
  params,
}: {
  params: Promise<{ season: string; event?: string[] }>;
}) {
  const { season, event } = await params;
  const event_string = `Rocket_League_Championship_Series/${season}/Birmingham_Major`;
  if (season !== '2025' || event) {
    return notFound();
  }
  const props = {
    swissInit: await get2025Swiss(event_string),
    playoffsInit: await getAFLPlayoffs(event_string),
  };
  return <SwissIntoAFL {...props} />;
}
