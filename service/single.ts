import { config } from "../config";
import { statistic } from "../decorators/statistic";
import { db } from "../utils/db";
import { nearUtils } from "../utils/near";
export class Single {
  @statistic
  static async readSingle(times: number = config.singleRunTimes) {
    const accountId = db.keys("private_keys")[0];
    return await Promise.allSettled(
      Array(times)
        .fill(null)
        .map((_, index) =>
          nearUtils
            .callFunction("counter_nelt.testnet", "get_counter", {}, accountId, true)
            .then((result) => ({ index, result }))
        )
    );
  }

  @statistic
  static async writeSingle(times: number = config.singleRunTimes) {
    const accountId = db.keys("private_keys")[0];
    return await Promise.allSettled(
      Array(times)
        .fill(null)
        .map((_, index) =>
          nearUtils
            .callFunction(
              "counter_nelt.testnet",
              "increment_counter",
              {},
              accountId
            )
            .then((result) => ({ index, result }))
        )
    );
  }
}
