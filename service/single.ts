import { db } from "../utils/db";
import { nearUtils } from "../utils/near";

interface DetailedResult {
  successCount: number;
  failedCount: number;
  time: string;
  errors: Array<{
    index: number;
    error: string;
    reason?: string;
    stack?: string;
  }>;
  successes: Array<{
    index: number;
    result: any;
  }>;
}

export const readSingleAccount = async (times: number): Promise<DetailedResult> => {
  const now = Date.now();
  const accountId = db.keys("private_keys")[0];
  
  console.log(`\n🔍 Starting single read operation with account: ${accountId}`);
  console.log(`📊 Executing ${times} read operations...`);
  
  const res = await Promise.allSettled(
    Array(times)
      .fill(null)
      .map((_, index) =>
        nearUtils.callFunction(
          "counter_nelt.testnet",
          "get_counter",
          {},
          accountId
        ).then(result => ({ index, result }))
      )
  );

  const errors: Array<{ index: number; error: string; reason?: string; stack?: string }> = [];
  const successes: Array<{ index: number; result: any }> = [];

  res.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successes.push(result.value);
    } else {
      const error = result.reason;
      errors.push({
        index,
        error: error?.message || 'Unknown error',
        reason: error?.reason || error?.toString(),
        stack: error?.stack
      });
    }
  });

  const successCount = successes.length;
  const failedCount = errors.length;

  console.log(`✅ Single Read Results:`);
  console.log(`   Success: ${successCount}/${times}`);
  console.log(`   Failed: ${failedCount}/${times}`);
  console.log(`   Time: ${(Date.now() - now) / 1000}s`);
  
  if (errors.length > 0) {
    console.log(`❌ Errors encountered:`);
    errors.forEach(err => {
      console.log(`   [${err.index}] ${err.error}`);
      if (err.reason) console.log(`      Reason: ${err.reason}`);
    });
  }

  return {
    successCount,
    failedCount,
    time: `${(Date.now() - now) / 1000}s (${times} times)`,
    errors,
    successes
  };
};

export const writeSingleAccount = async (times: number): Promise<DetailedResult> => {
  const now = Date.now();
  const accountId = db.keys("private_keys")[0];
  
  console.log(`\n✍️  Starting single write operation with account: ${accountId}`);
  console.log(`📊 Executing ${times} write operations...`);
  
  const res = await Promise.allSettled(
    Array(times)
      .fill(null)
      .map((_, index) =>
        nearUtils.callFunction(
          "counter_nelt.testnet",
          "increment_counter",
          {},
          accountId
        ).then(result => ({ index, result }))
      )
  );

  const errors: Array<{ index: number; error: string; reason?: string; stack?: string }> = [];
  const successes: Array<{ index: number; result: any }> = [];

  res.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successes.push(result.value);
    } else {
      const error = result.reason;
      errors.push({
        index,
        error: error?.message || 'Unknown error',
        reason: error?.reason || error?.toString(),
        stack: error?.stack
      });
    }
  });

  const successCount = successes.length;
  const failedCount = errors.length;

  console.log(`✅ Single Write Results:`);
  console.log(`   Success: ${successCount}/${times}`);
  console.log(`   Failed: ${failedCount}/${times}`);
  console.log(`   Time: ${(Date.now() - now) / 1000}s`);
  
  if (errors.length > 0) {
    console.log(`❌ Errors encountered:`);
    errors.forEach(err => {
      console.log(`   [${err.index}] ${err.error}`);
      if (err.reason) console.log(`      Reason: ${err.reason}`);
    });
  }

  return {
    successCount,
    failedCount,
    time: `${(Date.now() - now) / 1000}s (${times} times)`,
    errors,
    successes
  };
};
