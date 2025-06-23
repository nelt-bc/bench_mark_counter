import { db } from "../utils/db";
import { nearUtils } from "../utils/near";

interface DetailedSimultaneousResult {
  successCount: number;
  failedCount: number;
  time: string;
  errors: Array<{
    accountId: string;
    index: number;
    error: string;
    reason?: string;
    stack?: string;
  }>;
  successes: Array<{
    accountId: string;
    index: number;
    result: any;
  }>;
}

export const readSimultaneously = async (): Promise<DetailedSimultaneousResult> => {
  const now = Date.now();
  const accounts = db.keys("private_keys");
  
  console.log(`\n🔍 Starting simultaneous read operation`);
  console.log(`📊 Executing read operations with ${accounts.length} accounts...`);
  
  const result = await nearUtils.callSimultaneously(
    "counter_nelt.testnet",
    "get_counter",
    {},
    accounts
  );

  const errors: Array<{ accountId: string; index: number; error: string; reason?: string; stack?: string }> = [];
  const successes: Array<{ accountId: string; index: number; result: any }> = [];

  result.forEach((res, index) => {
    const accountId = accounts[index];
    if (res.status === "fulfilled") {
      successes.push({
        accountId,
        index,
        result: res.value
      });
    } else {
      const error = res.reason;
      errors.push({
        accountId,
        index,
        error: error?.message || 'Unknown error',
        reason: error?.reason || error?.toString(),
        stack: error?.stack
      });
    }
  });

  const successCount = successes.length;
  const failedCount = errors.length;

  console.log(`✅ Simultaneous Read Results:`);
  console.log(`   Success: ${successCount}/${accounts.length}`);
  console.log(`   Failed: ${failedCount}/${accounts.length}`);
  console.log(`   Time: ${(Date.now() - now) / 1000}s`);
  
  if (errors.length > 0) {
    console.log(`❌ Errors encountered:`);
    errors.forEach(err => {
      console.log(`   [${err.index}] ${err.accountId}: ${err.error}`);
      if (err.reason) console.log(`      Reason: ${err.reason}`);
    });
  }

  return {
    successCount,
    failedCount,
    time: `${(Date.now() - now) / 1000}s (${accounts.length} accounts)`,
    errors,
    successes
  };
};

export const writeSimultaneously = async (): Promise<DetailedSimultaneousResult> => {
  const now = Date.now();
  const accounts = db.keys("private_keys");
  
  console.log(`\n✍️  Starting simultaneous write operation`);
  console.log(`📊 Executing write operations with ${accounts.length} accounts...`);

  const result = await nearUtils.callSimultaneously(
    "counter_nelt.testnet",
    "increment_counter",
    {},
    accounts
  );

  const errors: Array<{ accountId: string; index: number; error: string; reason?: string; stack?: string }> = [];
  const successes: Array<{ accountId: string; index: number; result: any }> = [];

  result.forEach((res, index) => {
    const accountId = accounts[index];
    if (res.status === "fulfilled") {
      successes.push({
        accountId,
        index,
        result: res.value
      });
    } else {
      const error = res.reason;
      errors.push({
        accountId,
        index,
        error: error?.message || 'Unknown error',
        reason: error?.reason || error?.toString(),
        stack: error?.stack
      });
    }
  });

  const successCount = successes.length;
  const failedCount = errors.length;

  console.log(`✅ Simultaneous Write Results:`);
  console.log(`   Success: ${successCount}/${accounts.length}`);
  console.log(`   Failed: ${failedCount}/${accounts.length}`);
  console.log(`   Time: ${(Date.now() - now) / 1000}s`);
  
  if (errors.length > 0) {
    console.log(`❌ Errors encountered:`);
    errors.forEach(err => {
      console.log(`   [${err.index}] ${err.accountId}: ${err.error}`);
      if (err.reason) console.log(`      Reason: ${err.reason}`);
    });
  }

  return {
    successCount,
    failedCount,
    time: `${(Date.now() - now) / 1000}s (${accounts.length} accounts)`,
    errors,
    successes
  };
};
