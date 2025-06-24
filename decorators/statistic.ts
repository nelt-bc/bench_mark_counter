import { camelToLowerWords } from "../utils/string";

export type DetailedResult = {
  successCount: number;
  failedCount: number;
  processTime: string;
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
};
export function statistic<T>(
  _: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value as (
    ...args: any[]
  ) => Promise<PromiseSettledResult<T>[]>;
  descriptor.value = async function (...args: any[]) {
    console.log(`🔍 Starting benchmark ${camelToLowerWords(propertyKey)}`);

    const now = Date.now();
    const res = await originalMethod.apply(this, args);
    const end = Date.now();

    const errors: Array<{
      index: number;
      error: string;
      reason?: string;
      stack?: string;
    }> = [];
    const successes: Array<{ index: number; result: any }> = [];

    res.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successes.push({ index, result: result.value });
      } else {
        const error = result.reason;
        errors.push({
          index,
          error: error?.message ?? "Unknown error",
          reason: error?.reason ?? error?.toString(),
          stack: error?.stack,
        });
      }
    });

    const successCount = successes.length;
    const failedCount = errors.length;
    const times = res.length;

    if (errors.length > 0) {
      console.log(`❌ Errors encountered:`);
      errors.forEach((err) => {
        console.log(`   [${err.index}] ${err.error}`);
        if (err.reason) console.log(`      Reason: ${err.reason}`);
      });
    }

    return {
      successCount,
      failedCount,
      processTime: `${(end - now) / 1000}s (${times} times)`,
      errors,
      successes,
    } as DetailedResult;
  };
}
