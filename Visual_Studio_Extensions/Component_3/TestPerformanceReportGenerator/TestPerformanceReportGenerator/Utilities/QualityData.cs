using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestPerformanceReportGenerator.Utilities
{
    /// <summary>
    /// Store code metrics and test quality data necessary to generate a single code quality report.
    /// </summary>
    public class QualityData
    {
        public string Time { get; set; }
        public string Version { get; set; }
        public string Hardware { get; set; }
        public string Failed { get; set; }
        public string Passed { get; set; }
        public string TestCases { get; set; }
        public string LineCoverage { get; set; }
        public string Duration { get; set; }
        public string Skipped { get; set; }
    }
}
