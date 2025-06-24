import { statistic } from "../decorators/statistic";
import { db } from "../utils/db";
import { nearUtils } from "../utils/near";

export class Simultaneously {
  @statistic
  static async readSimultaneously() {
    const accounts = db.keys("private_keys");
    return await nearUtils.callSimultaneously(
      "counter_nelt.testnet",
      "get_counter",
      {},
      accounts,
      true
    );
  }

  @statistic
  static async writeSimultaneously() {
    const accounts = db.keys("private_keys");
    return await nearUtils.callSimultaneously(
      "counter_nelt.testnet",
      "increment_counter",
      {},
      accounts      
    );
  }
}
