using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;
using System.Threading.Tasks;
using System.IO;

namespace TestPerformanceReportGenerator.Utilities
{
    public class ReportGenerator
    {
        public List<QualityData> dataList = new List<QualityData>();

        public void AddTestData(string date, string version, string hardware, string failedTests, 
            string passedTests, string testCases, string lineCoverage, string testDuration, string device)
        {
            this.dataList.Add(new QualityData()
            {
                Date = date,
                Version = version,
                Hardware = hardware,
                Failed = failedTests,
                Passed = passedTests,
                TestCases = testCases,
                LineCoverage = lineCoverage,
                Duration = testDuration,
                Devices = device
            });
            
        }
        public void GenerateReport(string projectName, List<QualityData> dataList,
            string maintainability, string cycloComplexity, string depthOfInheritnace, string classCoupling,
            string losc, string loec)
        {
            string tablestr = "";
            string coverageOptionXAxis = "";
            string coverageOptionYAxis = "";

            string reportFile = FileHelper.ReadFile(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestTemplate.html"));
            // string reportFile = FileHelper.ReadFile("../Utilities/TestTemplate.html");

            reportFile = reportFile.Replace("{$ProjectName$}", projectName);
            reportFile = reportFile.Replace("{$SOURCECODE$}", losc);
            reportFile = reportFile.Replace("{$EXECUTABLECODE$}", loec);

            reportFile = reportFile.Replace("{$MaintainabilityIndex$}", maintainability);
            reportFile = reportFile.Replace("{$MaintainabilityIndexSchedule$}", (100 - Int32.Parse(maintainability)) + "");

            reportFile = reportFile.Replace("{$CyclomaticComplexity$}", cycloComplexity);
            reportFile = reportFile.Replace("{$DepthOfInheritance$}", depthOfInheritnace);
            reportFile = reportFile.Replace("{$ClassCoupling$}", classCoupling);

            int index = 0;
            foreach(QualityData item in this.dataList)
            {
                tablestr += $@"<tr>
                               <td>{item.Date}</td>
                               <td>{item.Version}</td>
                               <td>{item.Hardware}</td>
                               <td>{item.Failed}/{item.Passed}&nbsp;&nbsp;<progress value='{item.Failed}' max='{item.Passed}'></progress></td>
                               <td>{item.TestCases}</td>                            
                               <td>{item.LineCoverage} %</td>
                               <td>{item.Duration} ms</td>
                               <td>{item.Devices}</td>
                               </tr>";

                coverageOptionXAxis += "'" + ++index + "',";
                coverageOptionYAxis += "'" + item.LineCoverage + "',";
            }
            reportFile = reportFile.Replace("{$tablestr$}", tablestr);
            reportFile = reportFile.Replace("{$linecoverageOptionxAxis$}", coverageOptionXAxis.TrimEnd(','));
            reportFile = reportFile.Replace("{$linecoverageOptionyAxis$}", coverageOptionYAxis.TrimEnd(','));


            // generate uniformal report name based on CodeQualityReport + Current date
            var dateCulture = new CultureInfo("en-GB");
            string dateNow = DateTime.Now.ToString("d",dateCulture);
            dateNow = dateNow.Replace("/", "");
            string reportName = "CodeQualityReport_" + dateNow + ".html";

            //Write to path "../Reports/CodeQualityReport_dmy.html"
            string[] outputPath = { AppDomain.CurrentDomain.BaseDirectory, "Reports", reportName};
            FileHelper.WriteFile(reportFile, Path.Combine(outputPath));
        }
    }
}
