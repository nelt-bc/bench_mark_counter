import { readSimultaneously, writeSimultaneously } from "./service/simultaneously"
import { readSingleAccount, writeSingleAccount } from "./service/single"

const analyzeErrors = (results: any[]) => {
  console.log(`\n📊 ERROR ANALYSIS SUMMARY:`);
  
  results.forEach((result, index) => {
    const operationName = Object.keys(result)[0];
    const data = result[operationName];
    
    if (data.errors && data.errors.length > 0) {
      console.log(`\n🔍 ${operationName.toUpperCase()} ERRORS:`);
      console.log(`   Total Errors: ${data.errors.length}`);
      
      // Group errors by type
      const errorTypes = new Map<string, number>();
      data.errors.forEach((err: any) => {
        const errorType = err.error ?? 'Unknown';
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

const main = async () => {
    console.log(`🚀 Starting Benchmark Tests...`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    
    try {
        const times = 3;
        
        console.log(`\n📋 Test Configuration:`);
        console.log(`   Single operations: ${times} times per account`);
        console.log(`   Simultaneous operations: all accounts at once`);
        
        const singleRead = await readSingleAccount(times);
        const singleWrite = await writeSingleAccount(times);
        const simultaneouslyRead = await readSimultaneously();
        const simultaneouslyWrite = await writeSimultaneously();

        const results = [
            { singleRead },
            { singleWrite },
            { simultaneouslyRead },
            { simultaneouslyWrite }
        ];

        console.log(`\n📈 FINAL RESULTS SUMMARY:`);
        console.table({
            singleRead: {
                success: singleRead.successCount,
                failed: singleRead.failedCount,
                time: singleRead.time
            },
            singleWrite: {
                success: singleWrite.successCount,
                failed: singleWrite.failedCount,
                time: singleWrite.time
            },
            simultaneouslyRead: {
                success: simultaneouslyRead.successCount,
                failed: simultaneouslyRead.failedCount,
                time: simultaneouslyRead.time
            },
            simultaneouslyWrite: {
                success: simultaneouslyWrite.successCount,
                failed: simultaneouslyWrite.failedCount,
                time: simultaneouslyWrite.time
            }
        });

        // Analyze errors in detail
        analyzeErrors(results);
        
        // Calculate overall statistics
        const totalOperations = results.reduce((sum, result) => {
            const data = Object.values(result)[0];
            return sum + data.successCount + data.failedCount;
        }, 0);
        
        const totalErrors = results.reduce((sum, result) => {
            const data = Object.values(result)[0];
            return sum + data.failedCount;
        }, 0);
        
        console.log(`\n🎯 OVERALL STATISTICS:`);
        console.log(`   Total Operations: ${totalOperations}`);
        console.log(`   Total Errors: ${totalErrors}`);
        console.log(`   Success Rate: ${((totalOperations - totalErrors) / totalOperations * 100).toFixed(2)}%`);
        
        if (totalErrors > 0) {
            console.log(`\n⚠️  WARNING: ${totalErrors} errors were encountered during testing`);
        } else {
            console.log(`\n🎉 SUCCESS: All operations completed without errors!`);
        }
        
    } catch (error) {
        console.error(`\n💥 CRITICAL ERROR in main execution:`);
        console.error(`   Error: ${error}`);
        console.error(`   Stack: ${(error as Error).stack}`);
        process.exit(1);
    }
    
    console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
    console.log(`🏁 Benchmark tests finished!`);
}

main()