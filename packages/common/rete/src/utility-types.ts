export type Update<T, TUpdate> = {
  [K in Exclude<keyof T, keyof TUpdate>]: T[K];
} & TUpdate;

type ToPositive<N extends number, Arr extends unknown[]> = `${N}` extends `-${infer P extends number}`
  ? Slice<Arr, P>["length"]
  : N;

type InitialN<Arr extends unknown[], N extends number, _Acc extends unknown[] = []> = _Acc["length"] extends
  | N
  | Arr["length"]
  ? _Acc
  : InitialN<Arr, N, [..._Acc, Arr[_Acc["length"]]]>;

export type Slice<Arr extends unknown[], Start extends number = 0, End extends number = Arr["length"]> = InitialN<
  Arr,
  ToPositive<End, Arr>
> extends [...InitialN<Arr, ToPositive<Start, Arr>>, ...infer Rest]
  ? Rest
  : [];
