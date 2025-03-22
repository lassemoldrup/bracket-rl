import BirminghamMajorEvent from './Rocket_League_Championship_Series/[season]/Birmingham_Major/[[...event]]/page';

export const revalidate = 60;

export default async function Current(_props: {}) {
  return <BirminghamMajorEvent params={Promise.resolve({ season: '2025' })} />;
}
