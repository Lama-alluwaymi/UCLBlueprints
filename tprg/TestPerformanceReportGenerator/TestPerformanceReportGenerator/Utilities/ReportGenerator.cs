using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestPerformanceReportGenerator.Utilities
{
    public class ReportGenerator
    {
        public List<QualityData> dataList;

        public void AddTestData(string date, string version, string hardware, string failedTests, 
            string passedTests, string testCases, string lineCoverage, string testDuration, string device)
        {
            
        }
        public void GenerateReport(string projectName, List<QualityData> dataList, 
            string maintainability, string cycloComplexity, string depthOfInheritnace, string classCoupling,
            string losc, string loec)
        {

        }
    }
}
