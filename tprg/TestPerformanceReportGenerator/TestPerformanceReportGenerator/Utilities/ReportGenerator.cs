using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace TestPerformanceReportGenerator.Utilities
{
    /// <summary>
    /// Helper class for report generations.
    /// </summary>
    public class ReportGenerator
    {
        public List<QualityData> dataList = new List<QualityData>();

        /// <summary>
        /// Add a QualityData object to the list to register outcome of a single test run.
        /// </summary>
        /// <param name="time">Time when the test run has finished</param>
        /// <param name="version">The version of current project</param>
        /// <param name="hardware">The CPU name and memory size of the machine that has executed the test run.</param>
        /// <param name="failedTests">Number of failed tests</param>
        /// <param name="passedTests">Number of passed tests</param>
        /// <param name="testCases">Total number of tests</param>
        /// <param name="lineCoverage">Line coverage obtained by the test suite</param>
        /// <param name="testDuration">Duration of the whole test</param>
        /// <param name="skipped">Number of skipped tests</param>
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
        /// <summary>
        /// Generates a single code quality report.
        /// </summary>
        /// <param name="projectName">The project name</param>
        /// <param name="dataList">The list of QualityData object (test run information)</param>
        /// <param name="maintainability">The maintainability index of the current project</param>
        /// <param name="cycloComplexity">The cyclomatic complexity metric of the current project</param>
        /// <param name="depthOfInheritnace">The depth of inheritance metric of the current project</param>
        /// <param name="classCoupling">The class coupling metric of the current project</param>
        /// <param name="losc">The lines of source code of the current project</param>
        /// <param name="loec">The lines of executable code of the current project</param>
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
            foreach (QualityData item in dataList)
            {
                tablestr += $@"<tr>
                               <td>{item.Time}</td>
                               <td>{item.Version}</td>
                               <td>{item.Hardware}</td>
                               <td><span id=""tot_testcases"">{item.Passed}/{item.TestCases}</span>&nbsp;&nbsp;<progress value='{item.Passed}' max='{item.TestCases}'></progress></td>
                               <td>{item.Skipped}</td>
                               <td>{item.Failed}</td>                            
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
            DirectoryInfo outputDir = FileHelper.GetSolutionDir();
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

        /// <summary>
        /// Generates an overview report based on all the code quality reports.
        /// </summary>
        public static void GenerateOverview()
        {
            // Get the overview report template from resource
            string overviewResName = "TestPerformanceReportGenerator.Resources.OverviewTemplate.html";
            string overviewFile = FileHelper.ReadFromResource(overviewResName);

            // Get all files in the Report folder
            string[] reportFiles = FileHelper.GetAllReportFiles();

            // Set data strings that are going to be replaced in the 
            string dateXAxis = "";
            string lineCoverageY = "";
            string testCasesY = "";
            string maintainabilityY = "";
            string cycloY = "";
            string depthOfInhY = "";
            string classCouplY = "";
            string projectName = "";

            foreach (string reportFilePath in reportFiles)
            {
                OverviewQualitytData data = FileHelper.ParseHtmlFile(reportFilePath);
                //dateXAxis += "'\"" + data.ReportDate + "\"',";
                //lineCoverageY += "'" + data.LineCoverage + "',";
                //testCasesY += "'" + data.TotalTestCases + "',";
                //maintainabilityY += "'" + data.Maintainability + "',";
                //cycloY += "'" + data.CyclomaticComplexity + "',";
                //depthOfInhY += "'" + data.DepthInheritance + "',";
                //classCouplY += "'" + data.ClassCoupling + "',";
                //projectName = data.ProjectName;
                dateXAxis += "\"" + data.ReportDate + "\",";
                lineCoverageY += data.LineCoverage + ",";
                testCasesY += data.TotalTestCases + ",";
                maintainabilityY += data.Maintainability + ",";
                cycloY += data.CyclomaticComplexity + ",";
                depthOfInhY += data.DepthInheritance + ",";
                classCouplY += data.ClassCoupling + ",";
                projectName = data.ProjectName;
            }

            overviewFile = overviewFile.Replace("{$dateXAxis$}", dateXAxis.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$LineCoverage$}", lineCoverageY.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$TestCases$}", testCasesY.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$MaintainabilityIndex$}", maintainabilityY.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$CyclomaticComplexity$}", cycloY.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$DepthOfInheritance$}", depthOfInhY.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$ClassCoupling$}", classCouplY.TrimEnd(','));
            overviewFile = overviewFile.Replace("{$ProjectName$}", projectName);

            // write file to repository
            DirectoryInfo outputDir = FileHelper.GetSolutionDir();
            string outputPath = outputDir.FullName;
            string[] path = { outputPath, "Overview_Report", "CodeQuality_Overview.html" };
            if (Directory.Exists(Path.Combine(outputPath, "Overview_Report")))
            {
                FileHelper.WriteFile(overviewFile, Path.Combine(path));
            }
            else
            {
                Directory.CreateDirectory(Path.Combine(outputPath, "Overview_Report"));
                FileHelper.WriteFile(overviewFile, Path.Combine(path));
            }
        }
    }
}
