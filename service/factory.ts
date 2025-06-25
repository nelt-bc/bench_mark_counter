import { NearUtils, nearUtils } from "../utils/near";
import { TxExecutionStatus } from "@near-js/types";
import { camelToLowerWords } from "../utils/string";

export type MultipleCallsParams = {
  contractId: string;
  methodName: string;
  args: Record<string, unknown>;
  isReadOnly?: boolean;
  txFinality?: TxExecutionStatus;
  runTimes: number;
};

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

type FuncContractCalls = (
  params: MultipleCallsParams
) => Promise<PromiseSettledResult<unknown>[]>;

class FunctionCallFactory {
  private readonly nearUtils: NearUtils;

  constructor(utils: NearUtils = nearUtils) {
    this.nearUtils = utils;
  }

  private readonly singleAccountSimultaneouslyCall = async (
    params: MultipleCallsParams
  ) => {
    const { contractId, methodName, args, isReadOnly, txFinality, runTimes } =
      params;
    const accountId = this.nearUtils.db.keys("private_keys")[0];
    return Promise.allSettled(
      Array.from({ length: runTimes }, () =>
        this.nearUtils.callFunction({
          accountId,
          contractId,
          methodName,
          args,
          isReadOnly,
          txFinality,
        })
      )
    );
  };

  private readonly multipleAccountsSimultaneouslyCall = async (
    params: MultipleCallsParams
  ) => {
    const { contractId, methodName, args, isReadOnly, txFinality, runTimes } =
      params;
    const accountIds = this.nearUtils.db
      .keys("private_keys")
      .slice(0, runTimes);

    return this.nearUtils.callSimultaneously({
      accountIds,
      contractId,
      methodName,
      args,
      isReadOnly,
      txFinality,
    });
  };

  createFunctionCall = (
    isUsingSingleAccount: boolean,
    runTimes: number,
    contractId: string,
    methodName: string,
    args: Record<string, unknown>,
    isReadOnly?: boolean,
    txFinality?: TxExecutionStatus
  ) => {
    const multipleCallParams: MultipleCallsParams = {
      contractId,
      methodName,
      args,
      isReadOnly,
      txFinality,
      runTimes,
    };
    return isUsingSingleAccount
      ? this.statisticWrapper(
          this.singleAccountSimultaneouslyCall,
          isUsingSingleAccount
        )(multipleCallParams)
      : this.statisticWrapper(
          this.multipleAccountsSimultaneouslyCall,
          isUsingSingleAccount
        )(multipleCallParams);
  }

  private readonly statisticWrapper = (
    func: FuncContractCalls,
    isUsingSingleAccount: boolean
  ) => {
    return async (params: MultipleCallsParams) => {
      const funcName = `${
        isUsingSingleAccount ? "single account" : "multiple accounts"
      } ${camelToLowerWords(params.methodName)}`;
      console.log(`🔍 Starting benchmark ${funcName}`);
      const now = Date.now();
      const res = await func(params);
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
  };
}

export const factory = new FunctionCallFactory();
