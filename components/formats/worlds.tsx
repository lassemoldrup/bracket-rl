import Tabbed from "components/tabbed";
import { SwissInitializer, WorldsInitializer } from "libs/types";
import Swiss from "./swiss";

export default function Worlds({
  wildcardInit: swissInit,
  mainInit,
}: {
  wildcardInit: SwissInitializer,
  mainInit: WorldsInitializer,
}) {
  return (
    <Tabbed tabNames={['Wildcard', 'Main Event']}>
      <Swiss init={swissInit} />
      <div>Main Event</div>
    </Tabbed>
  );
}
