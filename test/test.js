import coffee from "coffee"
import ms from "ms.macro"
import path from "path"

const main = path.resolve(process.env.MAIN)

it("should run", () => coffee.fork(main, ["A"])
  .expect("code", 1)
  .expect("stdout", /Result: invalidNpmName/s)
  .end(), ms`30 seconds`)