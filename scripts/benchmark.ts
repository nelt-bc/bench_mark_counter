import { benchmark } from "../service/benchmark";
import { factory } from "../service/factory";
import "reflect-metadata";

const main = async () => {
  const contractId = "counter_nelt.testnet";
  const readMethodName = "get_counter";
  const writeMethodName = "increment_counter";

  try {
    await benchmark([
      {
        name: `Single account ${readMethodName}`,
        func: factory.createFunctionCall,
        args: [true, 3, contractId, readMethodName, {}, true]
      },
      {
        name: `Single account ${writeMethodName}`,
        func: factory.createFunctionCall,
        args: [true, 3, contractId, writeMethodName, {}, false, "INCLUDED"]
      },
      {
        name: `Multiple accounts ${readMethodName}`,
        func: factory.createFunctionCall,
        args: [false, 3, contractId, readMethodName, {}, true]
      },
      {
        name: `Multiple accounts ${writeMethodName}`,
        func: factory.createFunctionCall,
        args: [false, 3, contractId, writeMethodName, {}, false, "INCLUDED"]
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
