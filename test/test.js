import path from "path"

import coffee from "coffee"

const main = path.resolve(process.env.MAIN)

it("should run", () => coffee.fork(main, ["A"])
  .expect("code", 1)
  .debug(true)
  .end())