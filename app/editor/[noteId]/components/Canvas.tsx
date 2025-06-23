import React from "react";
import Block from "./Block";

const Canvas = () => {
  return (
    <div className="aspect-[10/16] bg-white min-w-80 sm:min-w-120 md:min-w-180 lg:min-w-200 shadow-sm rounded relative prose">
      <Block blockId="1" />
      <Block blockId="2" />
    </div>
  );
};

export default Canvas;
