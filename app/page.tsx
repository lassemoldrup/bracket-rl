import Major2Event from './Rocket_League_Championship_Series/[season]/Major_2/[[...event]]/page';

export const revalidate = 60;

export default async function Current(_props: {}) {
  return <Major2Event params={{ season: '2024' }} />;
}
