import Tabbed from "components/tabbed";
import { SwissInitializer } from "libs/types";
import Swiss from "./swiss";

export default function Worlds({
  swissInit,
}: {
  swissInit: SwissInitializer
}) {
  return (
    <Tabbed tabNames={['Wildcard', 'Main Event']}>
      <Swiss init={swissInit} />
      <div>Main Event</div>
    </Tabbed>
  );
}
