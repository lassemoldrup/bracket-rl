'use client';

import { useRef, useState } from "react";
import Controls from "components/controls";
import DoubleElim from "./formats/doubleElim";
import { Swiss } from "libs/swiss";
import { BracketInitializer, FormatInitializer, FormatKind, SwissInitializer } from "libs/types";
import { DoubleElimBracket } from "libs/formats/doubleElim";

type FormatModel = DoubleElimBracket | Swiss;

export default function Format({
  init,
}: {
  init: FormatInitializer,
}) {
  const formatRef = useRef(null);
  const [format, setFormat] = useState(getFormatModel(init));
  const clearFormat = () => setFormat(getFormatModel({ ...init, matchScores: [] }));

  const renderFormat = (format: FormatModel, kind: FormatKind) => {
    switch (kind) {
      case FormatKind.DoubleElim:
        const redrawBracket = () => setFormat({ ...format } as DoubleElimBracket)
        return <DoubleElim bracket={format as DoubleElimBracket} redrawBracket={redrawBracket} />
      default:
        return <div>Unsupported Format.</div>
    }
  };

  const renderedFormat = renderFormat(format, init.kind);
  return (<>
    <div ref={formatRef}>
      {renderedFormat}
    </div>
    <Controls formatElement={formatRef.current} clearFormat={clearFormat} />
  </>);
}

function getFormatModel(init: FormatInitializer): FormatModel {
  switch (init.kind) {
    case FormatKind.DoubleElim:
      return new DoubleElimBracket(init as BracketInitializer);
    case FormatKind.Swiss:
      return new Swiss(init as SwissInitializer);
  }
}
