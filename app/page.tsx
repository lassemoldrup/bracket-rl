import Major1Event from './Rocket_League_Championship_Series/[season]/Major_1/[[...event]]/page';

export const revalidate = 60;

export default async function Current(_props: {}) {
  return <Major1Event params={{ season: '2024' }} />;
}
