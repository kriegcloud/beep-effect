"use client";
import { useTick } from "@pixi/react";
import Matter from "matter-js";
import React from "react";

const EngineContext = React.createContext<Matter.Engine | null>(null);
export const useEngine = () => React.useContext(EngineContext);

export const World: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [engine] = React.useState(() => Matter.Engine.create());

  React.useEffect(() => {
    engine.gravity.y = 0;
    engine.constraintIterations = 7;
  }, [engine]);

  useTick((ticker) => Matter.Engine.update(engine, ticker.deltaTime * (1000 / 60)));

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
};
