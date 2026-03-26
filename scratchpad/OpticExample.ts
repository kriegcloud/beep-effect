import { BunRuntime } from "@effect/platform-bun";
import { Effect, Optic, Option, Result, Schema } from "effect";

/**
 * A runnable field guide for `effect/Optic` in Effect v4.
 *
 * Ground truth checked locally in:
 * - `.repos/effect-v4/packages/effect/src/Optic.ts`
 * - `.repos/effect-v4/packages/effect/test/Optic.test.ts`
 *
 * Run with:
 * `bun run scratchpad/OpticExample.ts`
 */

const inspect = (value: unknown): string =>
  typeof value === "string" ? value : Bun.inspect(value, { depth: 10 });

const section = (title: string): void => {
  console.log(`\n=== ${title} ===`);
};

const line = (label: string, value: unknown): void => {
  console.log(`${label}: ${inspect(value)}`);
};

const resultSummary = <A>(result: Result.Result<A, string>) =>
  Result.isSuccess(result)
    ? { _tag: "Success" as const, success: result.success }
    : { _tag: "Failure" as const, failure: result.failure };

const optionSummary = <A>(option: Option.Option<A>) =>
  Option.isSome(option)
    ? { _tag: "Some" as const, value: option.value }
    : { _tag: "None" as const };

type Task = {
  readonly id: number;
  readonly done: boolean;
  readonly title: string;
};

type Project = {
  readonly id: number;
  readonly name: string;
  readonly tasks: ReadonlyArray<Task>;
};

type AppState = {
  readonly user: {
    readonly profile: {
      readonly name: string;
      readonly age: number;
      readonly nickname?: string | undefined;
      readonly bio?: string;
    };
    readonly selectedTaskId: Option.Option<number>;
  };
  readonly settings: {
    readonly theme: "light" | "dark";
    readonly locale: string;
  };
  readonly projects: ReadonlyArray<Project>;
};

const initialState: AppState = {
  user: {
    profile: {
      name: "Ada",
      age: 30,
      nickname: undefined,
      bio: "Ships Effect apps"
    },
    selectedTaskId: Option.none()
  },
  settings: {
    theme: "light",
    locale: "en-US"
  },
  projects: [
    {
      id: 1,
      name: "Alpha",
      tasks: [
        { id: 1, done: false, title: "Design schema" },
        { id: 2, done: true, title: "Write tests" }
      ]
    },
    {
      id: 2,
      name: "Beta",
      tasks: [{ id: 3, done: false, title: "Polish docs" }]
    }
  ]
};

const program = Effect.sync(() => {
  section("Identity, Lenses, and Structural Sharing");

  const identity = Optic.id<number>();
  line("id.get(41)", identity.get(41));
  line("id.set(99)", identity.set(99));
  line("id.modify((n) => n + 1)(41)", identity.modify((n) => n + 1)(41));

  const age = Optic.id<AppState>().key("user").key("profile").key("age");
  const updatedAge = age.replace(31, initialState);
  const sameAge = age.replace(30, initialState);

  line("age.get(initialState)", age.get(initialState));
  line("age.replace(31, initialState)", updatedAge);
  line("updatedAge.user !== initialState.user", updatedAge.user !== initialState.user);
  line("updatedAge.settings === initialState.settings", updatedAge.settings === initialState.settings);
  line("updatedAge.projects === initialState.projects", updatedAge.projects === initialState.projects);
  line("same-value replace still allocates a new root", sameAge !== initialState);

  section("key vs optionalKey vs at");

  type Profile = {
    readonly nickname?: string | undefined;
    readonly bio?: string;
  };

  const nicknameKey = Optic.id<Profile>().key("nickname");
  const bioOptionalKey = Optic.id<Profile>().optionalKey("bio");

  line("key('nickname').get({})", nicknameKey.get({}));
  line("key('nickname').replace(undefined, {})", nicknameKey.replace(undefined, {}));
  line("optionalKey('bio').replace('Writes docs', {})", bioOptionalKey.replace("Writes docs", {}));
  line("optionalKey('bio').replace(undefined, { bio: 'Writes docs' })", bioOptionalKey.replace(undefined, {
    bio: "Writes docs"
  }));

  const home = Optic.id<Record<string, string>>().at("HOME");
  line("at('HOME').getResult({ HOME: '/Users/ada' })", resultSummary(home.getResult({ HOME: "/Users/ada" })));
  line("at('HOME').getResult({ PATH: '/bin' })", resultSummary(home.getResult({ PATH: "/bin" })));
  line("at('HOME').replace('/srv/app', { PATH: '/bin' })", home.replace("/srv/app", { PATH: "/bin" }));
  line(
    "at('HOME').replaceResult('/srv/app', { PATH: '/bin' })",
    resultSummary(home.replaceResult("/srv/app", { PATH: "/bin" }))
  );

  type FeatureFlags = {
    readonly alpha: boolean;
    readonly beta: boolean;
    readonly staff: boolean;
  };

  const flags: FeatureFlags = { alpha: true, beta: false, staff: false };
  const publicFlags = Optic.id<FeatureFlags>().pick(["alpha", "staff"] as const);
  const withoutBeta = Optic.id<FeatureFlags>().omit(["beta"] as const);

  line("pick(['alpha', 'staff']).get(flags)", publicFlags.get(flags));
  line(
    "pick(['alpha', 'staff']).replace({ alpha: false, staff: true }, flags)",
    publicFlags.replace({ alpha: false, staff: true }, flags)
  );
  line("omit(['beta']).get(flags)", withoutBeta.get(flags));
  line(
    "omit(['beta']).replace({ alpha: false, staff: true }, flags)",
    withoutBeta.replace({ alpha: false, staff: true }, flags)
  );

  section("Validation and Narrowing");

  const positiveInt = Optic.fromChecks<number>(Schema.isInt(), Schema.isGreaterThan(0));
  line("fromChecks(...).getResult(3)", resultSummary(positiveInt.getResult(3)));
  line("fromChecks(...).getResult(0)", resultSummary(positiveInt.getResult(0)));
  line("fromChecks(...).getResult(1.25)", resultSummary(positiveInt.getResult(1.25)));

  const retries = Optic.id<{ readonly retries: number }>()
    .key("retries")
    .check(Schema.isInt(), Schema.isGreaterThan(0));
  line("check(...).getResult({ retries: 3 })", resultSummary(retries.getResult({ retries: 3 })));
  line("check(...).getResult({ retries: 0 })", resultSummary(retries.getResult({ retries: 0 })));
  line("check(...).modify((n) => n + 1)({ retries: 0 })", retries.modify((n) => n + 1)({ retries: 0 }));

  type SearchHit =
    | { readonly kind: "user"; readonly name: string }
    | { readonly kind: "repo"; readonly repo: string; readonly stars: number };

  const isRepoHit = (hit: SearchHit): hit is Extract<SearchHit, { readonly kind: "repo" }> => hit.kind === "repo";

  const repoStars = Optic.id<SearchHit>()
    .refine(isRepoHit, { expected: "a repo search hit" })
    .key("stars");

  line(
    "refine(...).key('stars').getResult({ kind: 'repo', repo: 'effect', stars: 12 })",
    resultSummary(repoStars.getResult({ kind: "repo", repo: "effect", stars: 12 }))
  );
  line(
    "refine(...).key('stars').getResult({ kind: 'user', name: 'Ada' })",
    resultSummary(repoStars.getResult({ kind: "user", name: "Ada" }))
  );

  type Job =
    | { readonly _tag: "Running"; readonly pid: number }
    | { readonly _tag: "Exited"; readonly exitCode: number };

  const runningPid = Optic.id<Job>().tag("Running").key("pid");
  const exitedJob: Job = { _tag: "Exited", exitCode: 1 };

  line("tag('Running').key('pid').getResult({ _tag: 'Running', pid: 44 })", resultSummary(
    runningPid.getResult({ _tag: "Running", pid: 44 })
  ));
  line("tag('Running').key('pid').replace(99, exitedJob)", runningPid.replace(99, exitedJob));
  line("tag('Running').key('pid').replaceResult(99, exitedJob)", resultSummary(runningPid.replaceResult(99, exitedJob)));

  const defined = Optic.id<string | undefined>().notUndefined();
  line("notUndefined().getResult('ada')", resultSummary(defined.getResult("ada")));
  line("notUndefined().getResult(undefined)", resultSummary(defined.getResult(undefined)));
  line("notUndefined().replace('grace', undefined)", defined.replace("grace", undefined));

  section("Compose and Built-in Prisms");

  const someNumber = Optic.id<Option.Option<number>>().compose(Optic.some());
  line("some().replace(42, Option.none())", optionSummary(someNumber.replace(42, Option.none())));

  // Lens + Prism produces an Optional in practice.
  const selectedTaskId = Optic.id<AppState>().key("user").key("selectedTaskId").compose(Optic.some());
  const stateWithSelection: AppState = {
    ...initialState,
    user: {
      ...initialState.user,
      selectedTaskId: Option.some(10)
    }
  };

  line("selectedTaskId.getResult(initialState)", resultSummary(selectedTaskId.getResult(initialState)));
  line("selectedTaskId.replaceResult(42, initialState)", resultSummary(selectedTaskId.replaceResult(42, initialState)));
  line(
    "selectedTaskId.replace(42, initialState).user.selectedTaskId",
    optionSummary(selectedTaskId.replace(42, initialState).user.selectedTaskId)
  );
  line(
    "selectedTaskId.replace(42, stateWithSelection).user.selectedTaskId",
    optionSummary(selectedTaskId.replace(42, stateWithSelection).user.selectedTaskId)
  );

  const noneSelection = Optic.id<Option.Option<number>>().compose(Optic.none());
  line("none().getResult(Option.none())", resultSummary(noneSelection.getResult(Option.none())));
  line("none().replace(undefined, Option.some(5))", optionSummary(noneSelection.replace(undefined, Option.some(5))));

  const saveSuccess = Optic.id<Result.Result<string, string>>().compose(Optic.success());
  const saveFailure = Optic.id<Result.Result<string, string>>().compose(Optic.failure());

  line(
    "success().getResult(Result.succeed('saved'))",
    resultSummary(saveSuccess.getResult(Result.succeed("saved")))
  );
  line(
    "success().replace('saved again', Result.fail('boom'))",
    resultSummary(saveSuccess.replace("saved again", Result.fail("boom")))
  );
  line(
    "failure().getResult(Result.fail('timeout'))",
    resultSummary(saveFailure.getResult(Result.fail("timeout")))
  );
  line(
    "failure().replace('network', Result.succeed('ok'))",
    resultSummary(saveFailure.replace("network", Result.succeed("ok")))
  );

  section("Traversal, getAll, modify, and modifyAll");

  type Post = {
    readonly title: string;
    readonly likes: number;
  };

  type Feed = {
    readonly posts: ReadonlyArray<Post>;
  };

  const feed: Feed = {
    posts: [
      { title: "draft", likes: 0 },
      { title: "launched", likes: 2 },
      { title: "popular", likes: 5 }
    ]
  };

  const positiveLikes = Optic.id<Feed>()
    .key("posts")
    .forEach((post) => post.key("likes").check(Schema.isGreaterThan(0)));

  line("getAll(positiveLikes)(feed)", Optic.getAll(positiveLikes)(feed));
  line(
    "positiveLikes.modify((likes) => likes.map((n) => n + 10))(feed)",
    positiveLikes.modify((likes) => likes.map((n) => n + 10))(feed)
  );
  line(
    "positiveLikes.modifyAll((like) => like + 1)(feed)",
    positiveLikes.modifyAll((like) => like + 1)(feed)
  );
  line(
    "positiveLikes.replaceResult([100], feed)",
    resultSummary(positiveLikes.replaceResult([100], feed))
  );

  const counters = { draft: 0, published: 3, archived: 1 };
  const nonZeroCounters = Optic.entries<number>()
    .forEach((entry) => entry.key(1).check(Schema.isGreaterThan(0)));

  line("entries().get(counters)", Optic.entries<number>().get(counters));
  line(
    "entries().set([['draft', 1], ['published', 2]])",
    Optic.entries<number>().set([
      ["draft", 1],
      ["published", 2]
    ])
  );
  line("getAll(nonZeroCounters)(counters)", Optic.getAll(nonZeroCounters)(counters));
  line(
    "nonZeroCounters.modifyAll((count) => count + 1)(counters)",
    nonZeroCounters.modifyAll((count) => count + 1)(counters)
  );

  section("Custom Constructors");

  type WrappedId = {
    readonly value: string;
  };

  const wrappedId = Optic.makeIso<WrappedId, string>(
    (wrapped) => wrapped.value,
    (value) => ({ value })
  );

  line("makeIso(...).get({ value: 'user-1' })", wrappedId.get({ value: "user-1" }));
  line("makeIso(...).set('user-42')", wrappedId.set("user-42"));

  const firstPoint = Optic.makeLens<readonly [number, number], number>(
    (point) => point[0],
    (x, point) => [x, point[1]] as const
  );

  line("makeLens(...).get([3, 4])", firstPoint.get([3, 4] as const));
  line("makeLens(...).replace(10, [3, 4])", firstPoint.replace(10, [3, 4] as const));

  const numericString = Optic.makePrism<string, number>(
    (value): Result.Result<number, string> => {
      const parsed = Number(value);
      return Number.isNaN(parsed)
        ? Result.fail(`Expected a numeric string, got ${value}`)
        : Result.succeed(parsed);
    },
    (value) => String(value)
  );

  line("makePrism(...).getResult('42')", resultSummary(numericString.getResult("42")));
  line("makePrism(...).getResult('oops')", resultSummary(numericString.getResult("oops")));
  line("makePrism(...).replace(99, 'oops')", numericString.replace(99, "oops"));

  const atExistingKey = (key: string) =>
    Optic.makeOptional<Record<string, number>, number>(
      (record) =>
        Object.hasOwn(record, key)
          ? Result.succeed(record[key] as number)
          : Result.fail(`Key "${key}" not found`),
      (value, record) =>
        Object.hasOwn(record, key)
          ? Result.succeed({ ...record, [key]: value })
          : Result.fail(`Key "${key}" not found`)
    );

  line("makeOptional(...).getResult({ x: 1 })", resultSummary(atExistingKey("x").getResult({ x: 1 })));
  line("makeOptional(...).getResult({ y: 1 })", resultSummary(atExistingKey("x").getResult({ y: 1 })));
  line("makeOptional(...).replace(2, { y: 1 })", atExistingKey("x").replace(2, { y: 1 }));

  section("Gotchas and Source-Backed Notes");

  class Counter {
    readonly value: number;
    constructor(value: number) {
      this.value = value;
    }
  }

  const cloneFailureMessage = (() => {
    try {
      return Optic.id<Counter>().key("value").replace(2, new Counter(1));
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  })();

  line(
    "class instances cannot be cloned by path updates",
    cloneFailureMessage
  );
  line(
    "compile-time note",
    "key()/optionalKey()/at()/pick()/omit() require a non-union object focus, so narrow with refine() or tag() first."
  );

  // Uncomment to see the compile-time guard in action:
  //
  // type Shape =
  //   | { readonly _tag: 'Circle'; readonly radius: number }
  //   | { readonly _tag: 'Square'; readonly side: number }
  //
  // const wontCompile = Optic.id<Shape>().key('radius')
});

BunRuntime.runMain(program);
