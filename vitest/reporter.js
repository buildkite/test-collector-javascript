import { JsonReporter } from 'vitest/reporters'
import { v4 as uuidv4 } from 'uuid'
import CI from '../util/ci.js'
import uploadTestResults from '../util/uploadTestResults.js'
import Paths from '../util/paths'

/*
 * Vites JsonReporter returns all the test results we need
 * https://vitest.dev/guide/reporters.html#json-reporter
 */
class VitestBuildkiteTestEngineReporter extends JsonReporter {
  constructor(options) {
    super(options);
    this._options = options;
    this._testEnv = new CI().env();
    this._tags = options?.tags;
  }

  onInit(ctx) {
    super.onInit(ctx)
    this._paths = new Paths({ rootDir: ctx.config.root }, this._testEnv.location_prefix)
  }

  /*
   * vitests JsonReporter.writeReport is called to save the JSON to a file
   * we override it to upload the test results to Buildkite
   * https://github.com/vitest-dev/vitest/blob/33b930a12feb9f8932b10ed9e41e078200f62379/packages/vitest/src/node/reporters/json.ts#L208
   */
  async writeReport(reportString) {
    const report = JSON.parse(reportString);
    const originStart = report.startTime;
    const testResults = report.testResults.flatMap((testResult) => {
      const prefixedTestPath = this._paths.prefixTestPath(testResult.name);
      const assertionResults = testResult.assertionResults.map(
        (assertionResult) => {
          const id = uuidv4();

          return {
            id: id,
            scope: assertionResult.ancestorTitles.join(' ').trim(),
            name: assertionResult.title,
            location: prefixedTestPath
              ? `${prefixedTestPath}:${assertionResult.location.line}`
              : null,
            file_name: prefixedTestPath,
            result: this.testEngineResult(assertionResult),
            failure_reason: this.testEngineFailureReason(assertionResult),
            failure_expanded: this.testEngineFailureExpanded(assertionResult),
            history: this.testEngineHistory(originStart, testResult, assertionResult),
          };
        },
      );

      return assertionResults;
    });

    return uploadTestResults(
      this._testEnv,
      this._tags,
      testResults,
      this._options,
    );
  }

  testEngineResult(assertionResults) {
    /*
     * https://github.com/vitest-dev/vitest/blob/33b930a12feb9f8932b10ed9e41e078200f62379/packages/vitest/src/node/reporters/json.ts#L22
     * vitest test statuses:
     * - failed
     * - pending
     * - passed
     * - skipped
     * - todo
     *
     * Buildkite Test Engine execution results:
     * - passed
     * - failed
     * - pending
     * - skipped
     * - unknown
     */
    return {
      failed: 'failed',
      pending: 'pending',
      passed: 'passed',
      skipped: 'skipped',
      todo: 'pending',
    }[assertionResults.status];
  }

  testEngineFailureMessages(assertionResults) {
    // Strip ANSI color codes from messages and split each line
    return assertionResults.failureMessages.join(' ').replace(/\u001b[^m]*?m/g,'').split("\n")
  }

  testEngineFailureReason(assertionResults) {
    return this.testEngineFailureMessages(assertionResults)[0]
  }

  testEngineFailureExpanded(assertionResults) {
    return [
      {
        expanded: this.testEngineFailureMessages(assertionResults).splice(1),
      },
    ];
  }

  testEngineHistory(originStart, testResult, assertionResults) {
    return {
      section: 'top',
      start_at: (testResult.startTime - originStart) / 1000,
      end_at: (testResult.endTime - originStart) / 1000,
      duration: assertionResults.duration / 1000,
    };
  }
}

export default VitestBuildkiteTestEngineReporter;
