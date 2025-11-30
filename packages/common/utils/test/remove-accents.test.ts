import { expect, test } from "bun:test";
import { removeAccents } from "@beep/utils/remove-accents";

test("remove accents from string", () => {
  const input =
    "ÀÁÂÃÄÅẤẮÆẦẰẢẠẨẪẬÇḈÈÉÊËẾḖỀḔẺẼẸỂỄỆÌÍÎÏḮỈỊÐÑÒÓÔÕÖØỐṌṒỎỌỔỖỘỜỞỠỚỢÙÚÛÜỦỤỬỮỰÝàáâãäåấắæầằảạẩẫậáçḉèéêëếḗềḕẻẽẹểễệìíîïḯỉịñòóôõöøốṍṓỏọổỗộờởỡớợùúûüủụửữựýÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģǴǵĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķḰḱĹĺĻļĽľĿŀŁłḾḿŃńŅņŇňŉŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšṢṣŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵẂẃŶŷŸŹźŻżŽžſƒƠơƯưǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜỨứṸṹǺǻǼǽǾǿðÞþṔṕṤṥX́x́ЃѓЌќA̋a̋E̋e̋I̋i̋ǸǹỒồṐṑỪừẀẁỲỳȀȁȄȅȈȉȌȍȐȑȔȕẲẴẶḜẳẵặḝC̆c̆ḪḫK̆k̆M̆m̆N̆n̆P̆p̆R̆r̆T̆t̆V̆v̆X̆x̆Y̆y̆ȂȆȊȎȃȇȋȏȒȓȖȗșțȘȚB̌b̌F̌f̌ǦǧȞȟJ̌ǰǨǩM̌m̌P̌p̌Q̌q̌ṦṧV̌v̌W̌w̌X̌x̌Y̌y̌A̧a̧B̧b̧ḐḑȨȩƐ̧ɛ̧ḨḩI̧i̧Ɨ̧ɨ̧M̧m̧O̧o̧Q̧q̧U̧u̧X̧x̧Z̧z";
  const output = removeAccents.remove(input);
  const expected =
    "AAAAAAAAAEAAAAAAACCEEEEEEEEEEEEEEIIIIIIIDNOOOOOOOOOOOOOOOOOOOUUUUUUUUUYaaaaaaaaaeaaaaaaaacceeeeeeeeeeeeeeiiiiiiinooooooooooooooooooouuuuuuuuuyyAaAaAaCcCcCcCcDdDdEeEeEeEeEeGgGgGgGgGgHhHhIiIiIiIiIiIJijJjKkKkLlLlLlLlLlMmNnNnNnnOoOoOoOEoeRrRrRrSsSsSsSsSsTtTtTtUuUuUuUuUuUuWwWwYyYZzZzZzsfOoUuAaIiOoUuUuUuUuUuUuUuAaAEaeOodTHthPpSsXxГгКкAaEeIiNnOoOoUuWwYyAaEeIiOoRrUuAAAEaaaeCcHhKkMmNnPpRrTtVvXxYyAEIOaeioRrUustSTBbFfGgHhJjKkMmPpQqSsVvWwXxYyAaBbDdEeEeHhIiIiMmOoQqUuXxZz";

  expect(output).toBe(expected);
});

test("remove cyrillic accents from string", () => {
  const input = "ЁёЙй";
  const output = removeAccents.remove(input);
  const expected = "ЕеИи";

  expect(output).toBe(expected);
});

test("do not modify non-accented strings", () => {
  const input = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789.,:;~`!@#$%^&*()-_=+[]{}'\"|\\<>?/eEиИ";
  const output = removeAccents.remove(input);

  expect(output).toBe(input);
});

test(".has can detect accents", () => {
  expect(removeAccents.has("À")).toBe(true);
  expect(removeAccents.has("Löwe")).toBe(true);

  expect(removeAccents.has("A")).toBe(false);
  expect(removeAccents.has("Panther")).toBe(false);
});

test(".remove method", () => {
  // .remove is an alias for .removeAccents
  expect(removeAccents.remove).toBe(removeAccents.removeAccents);

  expect(removeAccents.remove("cat")).toBe("cat");
  expect(removeAccents.remove("Pokémon")).toBe("Pokemon");
});

// See https://github.com/tyxla/remove-accents/issues/12
test("ß is not accented", () => {
  expect(removeAccents.remove("Straße")).toBe("Straße");
});
