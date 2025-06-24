import { NearUtils } from "../utils/near";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("times", {
    alias: "t",
    type: "number",
    demandOption: true,
    describe: "Number of times",
  })
  .check((argv) => {
    if (isNaN(argv.times) || argv.times <= 0) {
      throw new Error("`--times` must be a positive number");
    }
    return true;
  })
  .parseSync();

const main = async () => {
  const near = new NearUtils();
  await near.createFundedAccounts(argv.times);
  console.log(`Create ${argv.times} accounts complete`);
};

main();
