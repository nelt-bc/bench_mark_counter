import { DetailedResult } from "../decorators/statistic";

export type BenchmarkFunc = (
  ...args: any[]
) => Promise<DetailedResult>;

export type BenchmarkFuncConfig = {
  func: BenchmarkFunc;
  name: string;
  args: any[];
};

export const benchmark = async (functions: BenchmarkFuncConfig[]) => {
  console.log(`🚀 Starting Benchmark Tests...`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  const results: { name: string; data: DetailedResult }[] = [];
  const logRecord: Record<
    string,
    {
      success: number;
      failed: number;
      processTime: string;
    }
  > = {};

  for (let { name, func, args } of functions) {
    const funcResult = (await func(...args))
    results.push({
      name,
      data: funcResult,
    });
    logRecord[name] = {
      success: funcResult.successCount,
      failed: funcResult.failedCount,
      processTime: funcResult.processTime,
    };
  }

  console.table(logRecord);
  analyzeErrors(results);

  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
  console.log(`🏁 Benchmark tests finished!`);

  const totalOperations = results.reduce((sum, { data }) => {
    return sum + data.successCount + data.failedCount;
  }, 0);

  const totalErrors = results.reduce((sum, { data }) => {
    return sum + data.failedCount;
  }, 0);

  console.log(`\n🎯 OVERALL STATISTICS:`);
  console.log(`   Total Operations: ${totalOperations}`);
  console.log(`   Total Errors: ${totalErrors}`);
  console.log(
    `   Success Rate: ${(
      ((totalOperations - totalErrors) / totalOperations) *
      100
    ).toFixed(2)}%`
  );

  if (totalErrors > 0) {
    console.log(
      `\n⚠️  WARNING: ${totalErrors} errors were encountered during testing`
    );
  } else {
    console.log(`\n🎉 SUCCESS: All operations completed without errors!`);
  }
};

const analyzeErrors = (results: { name: string; data: DetailedResult }[]) => {
  console.log(`📊 ERROR ANALYSIS SUMMARY:`);

  results.forEach(({ name: operationName, data }) => {
    if (data.errors && data.errors.length > 0) {
      console.log(`🔍 ${operationName.toUpperCase()} ERRORS:`);
      console.log(`   Total Errors: ${data.errors.length}`);

      // Group errors by type
      const errorTypes = new Map<string, number>();
      data.errors.forEach((err: any) => {
        const errorType = err.error ?? "Unknown";
        errorTypes.set(errorType, (errorTypes.get(errorType) ?? 0) + 1);
      });

      console.log(`   Error Types:`);
      errorTypes.forEach((count, type) => {
        console.log(`     - ${type}: ${count} occurrences`);
      });

      // Show first few detailed errors
      console.log(`   Sample Errors:`);
      data.errors.slice(0, 3).forEach((err: any) => {
        console.log(`     [${err.index ?? err.accountId}] ${err.error}`);
        if (err.reason) console.log(`        Reason: ${err.reason}`);
      });

      if (data.errors.length > 3) {
        console.log(`     ... and ${data.errors.length - 3} more errors`);
      }
    } else {
      console.log(`\n✅ ${operationName.toUpperCase()}: No errors encountered`);
    }
  });
};
