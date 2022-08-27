using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace TestPerformanceReportGenerator.Utilities
{
    public class ReportGenerator
    {
        public List<QualityData> dataList = new List<QualityData>();

        public void AddTestData(string time, string version, string hardware, string failedTests, 
            string passedTests, string testCases, string lineCoverage, string testDuration, string skipped)
        {
            this.dataList.Add(new QualityData()
            {
                Time = time,
                Version = version,
                Hardware = hardware,
                Failed = failedTests,
                Passed = passedTests,
                TestCases = testCases,
                LineCoverage = lineCoverage,
                Duration = testDuration,
                Skipped = skipped  
            });
            
        }
        public static void GenerateReport(string projectName, List<QualityData> dataList,
            string maintainability, string cycloComplexity, string depthOfInheritnace, string classCoupling,
            string losc, string loec)
        {
            // generate uniformal report name based on CodeQualityReport + Current date
            var dateCulture = new CultureInfo("en-GB");
            string dateNow = DateTime.Now.ToString("d", dateCulture);
            string dateFormatted = dateNow.Replace("/", "");
            string reportName = "CodeQualityReport_" + dateFormatted + ".html";

            string tablestr = "";
            string coverageOptionXAxis = "";
            string coverageOptionYAxis = "";

            //string reportFile = FileHelper.ReadFile(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestTemplate.html"));
            //var root = Path.GetDirectoryName(typeof(VisualStudioServices).Assembly.Location);
            //string reportFile = FileHelper.ReadFile(Path.Combine(root!, "Utilities", "TestTemplate.html"));
            string resourceName = "TestPerformanceReportGenerator.Resources.TestTemplate.html";
            string reportFile = FileHelper.ReadFromResource(resourceName);

            reportFile = reportFile.Replace("{$ProjectName$}", projectName);
            reportFile = reportFile.Replace("{$ReportDate$}", dateNow);
            reportFile = reportFile.Replace("{$SOURCECODE$}", losc);
            reportFile = reportFile.Replace("{$EXECUTABLECODE$}", loec);

            reportFile = reportFile.Replace("{$MaintainabilityIndex$}", maintainability);
            reportFile = reportFile.Replace("{$MaintainabilityIndexSchedule$}", (100 - Int32.Parse(maintainability)) + "");

            reportFile = reportFile.Replace("{$CyclomaticComplexity$}", cycloComplexity);
            reportFile = reportFile.Replace("{$DepthOfInheritance$}", depthOfInheritnace);
            reportFile = reportFile.Replace("{$ClassCoupling$}", classCoupling);

            int index = 0;
            foreach(QualityData item in dataList)
            {   
                tablestr += $@"<tr>
                               <td>{item.Time}</td>
                               <td>{item.Version}</td>
                               <td>{item.Hardware}</td>
                               <td>{item.Failed}/{item.Passed}&nbsp;&nbsp;<progress value='{item.Failed}' max='{item.Passed}'></progress></td>
                               <td>{item.Skipped}</td>
                               <td id=""tot_testcase"">{item.TestCases}</td>                            
                               <td id=""line_cov"">{item.LineCoverage} %</td>
                               <td>{item.Duration} ms</td>
                               </tr>";

                coverageOptionXAxis += "'" + ++index + "',";
                coverageOptionYAxis += "'" + item.LineCoverage + "',";
            }
            reportFile = reportFile.Replace("{$tablestr$}", tablestr);
            reportFile = reportFile.Replace("{$linecoverageOptionxAxis$}", coverageOptionXAxis.TrimEnd(','));
            reportFile = reportFile.Replace("{$linecoverageOptionyAxis$}", coverageOptionYAxis.TrimEnd(','));

            //Write to path "../Reports/CodeQualityReport_dmy.html"
            DirectoryInfo outputDir = FileHelper.getSolutionDir();
            string outputPath = outputDir.FullName;
            string[] path = { outputPath, "Reports", reportName };
            if (Directory.Exists(Path.Combine(outputPath, "Reports")))
            {
                FileHelper.WriteFile(reportFile, Path.Combine(path));
            }
            else
            {
                Directory.CreateDirectory(Path.Combine(outputPath, "Reports"));
                FileHelper.WriteFile(reportFile, Path.Combine(path));
            }

        }
    }
}
