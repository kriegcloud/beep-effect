import { describe, expect, it } from "bun:test";
import { beep } from "../../src";

describe("Examples in readme...", () => {
  it("foobar works", () => {
    type Schema = {
      count: number;
      message: string;
    };

    // Start a session, `true` turns on autofiring!
    const { insert, rule } = beep<Schema>(true);

    // Rules capturiing your business logic, select only the relevant data!
    rule(
      "multiples of 5 are foo, multiples of 7 are bar, multiples of both are foobar, otherwise it's just the count",
      ({ count }) => ({
        current: {
          count,
        },
      })
    ).enact({
      then: ({ current }) => {
        const foo = current.count % 5 === 0 ? "foo" : "";
        const bar = current.count % 7 === 0 ? "bar" : "";
        const message = `${foo}${bar}`;
        insert({
          print: { message: message === "" ? `${current.count}` : message },
        });
      },
    });

    const results = rule("console.log when count changes", ({ message }) => ({
      print: {
        message,
      },
    })).enact({
      then: ({ print }) => console.log(print.message),
    });

    // Insert facts for your rules!
    insert({ current: { count: 1 } }); // "1"
    expect(results.query()[0]!.print.message).toBe("1");
    insert({ current: { count: 5 } }); // "foo"
    expect(results.query()[0]!.print.message).toBe("foo");
    insert({ current: { count: 7 } }); // "bar"
    expect(results.query()[0]!.print.message).toBe("bar");
    insert({ current: { count: 35 } }); // "foobar"
    expect(results.query()[0]!.print.message).toBe("foobar");
  });

  it("bday works", () => {
    type Schema = {
      fullName: string;
      email: string;
      birthDay: Date;
      isCelebratingBirthDay: boolean;

      // An attribute that will be tied to a "single" fact
      todaysDate: Date;
    };

    // This `session` will maintain it's own database of facts and rules. It also will
    // expose functions to add/remove new rules and facts, query the facts etc.
    //
    // Edict does not create "global" data, each invocation of `beep()` creates
    // new independent sessions
    const mySession = beep<Schema>();

    const { rule } = mySession;

    rule("When a birthday is today, celebrate the birthday!", ({ birthDay, todaysDate }) => ({
      // "today" matches the id when inserting the fact (see above)
      today: {
        todaysDate,
      },

      // "$user" is a _bound_ id. By prefixing the id with "$" you signal to beep that
      // you want to match ANY fact with the following attributes. This allows you to "join"
      // many facts to be processed by this rule!
      $user: {
        birthDay,
      },
    }))
      // `rule()` returns an object with `enact()`
      // `enact()` let's you apply reactions to the
      // rule you've defined, and adds it to the session
      .enact({
        // "when" filters out facts, runs before "then"
        when: ({ $user, today }) => {
          // Match users who have a birthday today!
          return (
            $user.birthDay.getMonth() === today.todaysDate.getMonth() &&
            $user.birthDay.getDate() === today.todaysDate.getDate()
          );
        },

        then: ({ $user }) => {
          insert({ [$user.id]: { isCelebratingBirthDay: true } });
        },
      });

    const usersCelebratingBirthdays = rule(
      "All users celebrating their birthday",
      ({ isCelebratingBirthDay, fullName }) => ({
        $user: {
          fullName,
          isCelebratingBirthDay,
        },
      })
    ).enact({ when: ({ $user }) => $user.isCelebratingBirthDay });

    // Here is how you would insert multiple facts about different people with names and emails
    const { insert } = mySession;

    insert({
      // "bob" is the "id", it could be an integer, uuid, whatever makes sense for your application!
      bob: {
        fullName: "Bob Johnson",
        email: "bob@hotmail.com",
        birthDay: new Date("2008-01-19"),
      },
      tom: {
        fullName: "Tom Kennedy",
        email: "tomk@aol.com",
        birthDay: new Date("1967-03-02"),
      },

      // Let's assume these two are twins born on the same day!
      jack: {
        fullName: "Jack Maxwell",
        email: "jack@gmail.com",
        birthDay: new Date("2022-03-02"),
      },
      jill: {
        fullName: "Jill Maxwell",
        email: "jill@gmail.com",
        birthDay: new Date("2022-03-02"),
      },

      // Let's pretend it's Tom, Jack and Jill's birthdays!
      today: { todaysDate: new Date("2022-03-02") },
    });
    const { fire } = mySession;
    fire();
    const users = usersCelebratingBirthdays.query();

    users.forEach(({ $user }) => console.log(`${$user.fullName} is celebrating their birthday!`));
    expect(users.length).toBe(3);
  });
});
