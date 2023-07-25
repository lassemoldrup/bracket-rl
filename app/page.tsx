import SpringEvent from './Rocket_League_Championship_Series/[season]/Spring/[[...event]]/page';

export const revalidate = 60;

export default async function Current(_props: {}) {
  return <SpringEvent params={{ season: '2022-23' }} />;
}
