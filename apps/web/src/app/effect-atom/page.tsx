"use client";
import { Label } from "@beep/ui/atoms";
import { Atom, useAtom, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";

//----------------------------------------------------------------------------------------------------------------------
// COUNTER
//----------------------------------------------------------------------------------------------------------------------
const countAtom = Atom.make(0);
const multiplierAtom = Atom.make(1);
const doubleAtom = Atom.make((get) => {
  const multiplier = get(multiplierAtom);
  return get(countAtom) * multiplier;
});

const DecrementButton = () => {
  const setCount = useAtomSet(countAtom);
  return (
    <Button onClick={() => setCount((count) => count - 1)} variant={"outlined"} title={"Decrement"}>
      -
    </Button>
  );
};

const ResetButton = () => {
  const count = useAtomValue(doubleAtom);
  const refresh = useAtomRefresh(countAtom);
  return (
    <Button onClick={() => refresh()} title="Reset count">
      Count is {count}
    </Button>
  );
};

const IncrementButton = () => {
  const setCount = useAtomSet(countAtom);
  return (
    <Button onClick={() => setCount((count) => count + 1)} title="Increment">
      +
    </Button>
  );
};

const Multiplier = () => {
  const [multiplier, setMultiplier] = useAtom(multiplierAtom);
  return (
    <Label>
      Multiply By
      <TextField type={"number"} value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} />
    </Label>
  );
};

const Counter = () => {
  return (
    <Container>
      <Multiplier />
      <DecrementButton />
      <ResetButton />
      <IncrementButton />
    </Container>
  );
};

//----------------------------------------------------------------------------------------------------------------------
// INFINITE
//----------------------------------------------------------------------------------------------------------------------

export default function Page() {
  return (
    <Container>
      <Counter />
    </Container>
  );
}
