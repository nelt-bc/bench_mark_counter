import { benchmark } from "../service/benchmark";
import { Simultaneously } from "../service/simultaneously";
import { Single } from "../service/single";
import "reflect-metadata";

const main = async () => {
  try {
    await benchmark([
      // {
      //   name: "Single.readSingle",
      //   func: Single.readSingle,
      // },
      // {
      //   name: "Single.writeSingle",
      //   func: Single.writeSingle,
      // },
      {
        name: "Simultaneously.readSimultaneously",
        func: Simultaneously.readSimultaneously,
      },
      {
        name: "Simultaneously.writeSimultaneously",
        func: Simultaneously.writeSimultaneously,
      },
    ]);
  } catch (error) {
    console.error(`\n💥 CRITICAL ERROR in main execution:`);
    console.error(`   Error: ${error}`);
    console.error(`   Stack: ${(error as Error).stack}`);
    process.exit(1);
  }
};

main();
