import { insertFactToFact } from "@beep/rete/core/utils";
import { describe, expect, it } from "@effect/vitest";

describe("Utils...", () => {
  it("Should parse a simple object into the IR", () => {
    const fact = { john: { age: 17, height: 88 } };

    expect(insertFactToFact(fact)).toStrictEqual([
      ["john", "age", 17],
      ["john", "height", 88],
    ]);
  });

  it("Should parse facts into the internal representation", () => {
    const slug =
      "Ducimus-consequatur-numquam-voluptatem-ipsum-vel-laborum-id-deserunt-esse-sequi-beatae-commodi-tenetur-excepturi-fugit-hic-excepturi-id-sunt-nostrum-rerum-exercitationem-tenetur-nostrum-nulla-qui-eos-maiores-hic-error.-Laborum-sequi-sed-unde-quae-cupiditate-commodi-est-et-aliquid-at-labore-sed-quasi-fugiat-id-beatae-in-consectetur-enim-sapiente-consequatur.-Quasi-commodi-blanditiis-reiciendis-neque-quia-excepturi-quia-labore-consequatur-exercitationem-quasi-deserunt-aliquid-voluptate-doloribus-non-quia-nostrum-quos-error-vel-repellat-error-blanditiis-nihil-nulla-fugiat-facilis-vitae-consequatur-sed.-Non-neque-id-possimus-maiores-vel-doloribus-qui-est-sit-dicta-rerum-quia-non-est-excepturi-aut-neque-consequatur-unde-quos-consectetur-vel-qui-ducimus-magnam-quas-nulla-consequuntur-in-quia-aliquid-est-cupiditate-beatae-at-hic.-Aliquid-est-nulla-dolores-nulla-nulla-at-quos-sed-excepturi.-105578";
    const title =
      "Ducimus consequatur numquam voluptatem ipsum vel laborum id deserunt esse sequi beatae, commodi tenetur excepturi fugit hic excepturi id sunt nostrum rerum exercitationem tenetur nostrum nulla, qui eos maiores hic error.\nLaborum sequi sed unde quae cupiditate commodi est et aliquid at labore sed quasi fugiat id beatae in consectetur enim sapiente consequatur.\nQuasi commodi blanditiis reiciendis neque quia excepturi quia labore consequatur exercitationem quasi, deserunt aliquid, voluptate doloribus non quia nostrum quos, error vel repellat error blanditiis nihil nulla fugiat, facilis vitae consequatur, sed.\nNon neque id possimus maiores vel doloribus qui est sit dicta, rerum quia non est, excepturi aut neque consequatur unde quos, consectetur vel qui ducimus magnam, quas nulla, consequuntur, in quia aliquid est cupiditate beatae at hic.\nAliquid est nulla dolores nulla nulla at quos sed excepturi.\n";
    const description =
      "Accusantium aliquid non neque dicta eum. Molestias nesciunt odit. Quis rerum et cumque distinctio a pariatur vel ea dicta.";
    const body =
      "Ducimus dolores recusandae.\\nEa aut aperiam et aut eos inventore.\\nQuia cum ducimus autem iste.\\nQuos consequuntur est delectus temporibus autem. Qui eligendi molestiae molestiae sit rem quis.\\nDucimus voluptates ut ducimus possimus quis.\\nCupiditate velit cupiditate harum impedit minima veniam ipsam amet atque.\\nEt architecto molestiae omnis eos aspernatur voluptatem occaecati non.\\nMolestiae inventore aut aut nesciunt totam eum a expedita illo. Reprehenderit quae quas quos sapiente ullam ut.\\nVoluptates non ut. Voluptatum tempora voluptas est odio iure odio dolorem.\\nVoluptatum est deleniti explicabo explicabo harum provident quis molestiae. Id est non ad temporibus nobis.\\nQuod soluta quae voluptatem quisquam est. Pariatur quo neque est perspiciatis non illo rerum expedita minima.\\nEt commodi voluptas eos ex.\\nUnde velit delectus deleniti deleniti non in sit.\\nAliquid voluptatem magni. Est est sed itaque necessitatibus vitae officiis.\\nIusto dolores sint eveniet quasi dolore quo laborum esse laboriosam.\\nModi similique aut voluptates animi aut dicta dolorum.\\nSint explicabo autem quidem et.\\nNeque aspernatur assumenda fugit provident. Ipsa laudantium deserunt. Consequuntur dolorem enim eos sit.\\nMollitia impedit dolor optio et dolorem.\\nVitae nulla eos excepturi culpa.\\nMagni iure optio quaerat.\\nAb sed sit autem et ut eum. Similique et quos maiores commodi exercitationem laborum animi qui.";
    const tagList = ["consequatur", "non", "nulla", "error"];
    const createdAt = "2022-10-09T10:14:34.003Z";
    const updatedAt = "2022-10-09T10:14:34.003Z";
    const favorited = false;
    const favoritesCount = 4;
    const author = {
      username: "Magda Parry",
      bio: null,
      image: "https://api.realworld.io/images/demo-avatar.png",
      following: false,
    };
    const data = {
      [slug]: {
        slug,
        title,
        description,
        body,
        tagList,
        createdAt,
        updatedAt,
        favorited,
        favoritesCount,
        author,
      },
    };

    const parsed = insertFactToFact(data);

    expect(parsed).toStrictEqual([
      [slug, "slug", slug],
      [slug, "title", title],
      [slug, "description", description],
      [slug, "body", body],
      [slug, "tagList", tagList],
      [slug, "createdAt", createdAt],
      [slug, "updatedAt", updatedAt],
      [slug, "favorited", favorited],
      [slug, "favoritesCount", favoritesCount],
      [slug, "author", author],
    ]);
  });
});
