import path from "path"

import coffee from "coffee"
import ms from "ms.macro"

const main = path.resolve(process.env.MAIN)

it("should run", () => coffee.fork(main, ["A"])
  .expect("code", 1)
  .debug(true)
  .end(), ms`30 seconds`)