"use client";
import {
  Atom,
  // useAtomSet,
  // RegistryProvider,
  // Result,
  useAtom,
  useAtomValue,
  // useAtomInitialValues,
  // useAtomMount,
  // useAtomRef,
  // useAtomRefProp,
  // useAtomRefPropValue,
  // useAtomRefresh,
  // useAtomSubscribe,
  // useAtomSuspense,
  // Hydration,
  // scheduleTask,
  // AtomHttpApi,
  // AtomRef,
  // AtomRpc,
} from "@effect-atom/atom-react";
// import * as Effect from "effect/Effect";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

// import * as A from "effect/Array";
// import {Form, formOptionsWithSubmitEffect, useAppForm} from "@beep/ui/form";
// import Stack from "@mui/material/Stack";
// import * as S from "effect/Schema";

// 1. Define atom
const countAtom = Atom.make(0);

function DisplayCount() {
  const count = useAtomValue(countAtom);
  return (
    <CardContent>
      <Typography variant={"h2"}>Current Count: {count}</Typography>
      <Typography>This component only reads the value</Typography>
    </CardContent>
  );
}

function Controls() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <CardActions>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
      <Button onClick={() => setCount(count - 1)}>Decrement</Button>
      <Button onClick={() => setCount(count * 2)}>Double</Button>
      <Button onClick={() => setCount(0)}>Reset</Button>
      <Typography>Current: {count}</Typography>
    </CardActions>
  );
}

function SecondaryDisplay() {
  const count = useAtomValue(countAtom);
  return <Typography variant={"subtitle1"}>Also displaying: {count}</Typography>;
}

const Page = () => {
  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card>
        <CardHeader title="@effect-atom/atom-react Counter" />
        <CardContent>
          <DisplayCount />

          <SecondaryDisplay />
        </CardContent>
        <Controls />
      </Card>
    </Box>
  );
};

export default Page;
