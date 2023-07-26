import WorldsEvent from './Rocket_League_Championship_Series/[season]/page';

export const revalidate = 60;

export default async function Current(_props: {}) {
  return <WorldsEvent params={{ season: '2022-23' }} />;
}
