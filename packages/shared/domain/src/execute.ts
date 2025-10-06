console.log(
  Array.from({ length: 2 })
    .map(() => "user__" + require("crypto").randomUUID())
    .join(",")
);
