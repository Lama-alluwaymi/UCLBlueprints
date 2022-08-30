using Microsoft.VisualStudio.TestTools.UnitTesting;
using TestPerformanceReportGenerator.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace TestPerformanceReportGenerator.Utilities.Tests
{
    [TestClass()]
    public class FileHelperTests
    {
        [TestMethod()]
        public void GetSolutionDirTest()
        {
            string expected = @"C:\Users\50264\source\repos\UCLBlueprintsV2\tprg\TestPerformanceReportGenerator";
            var directory = FileHelper.GetSolutionDir();
            Assert.IsTrue(directory.GetType() == typeof(DirectoryInfo));
            Assert.AreEqual(directory.FullName, expected);
        }

        [TestMethod()]
        public void GetSolutionNameTest()
        {
            string expected = "TestPerformanceReportGenerator";
            string output = FileHelper.GetSolutionName();

            Assert.AreEqual(output, expected);
        }

        [TestMethod()]
        [ExpectedException(typeof(DirectoryNotFoundException))]
        public void GetAllReportFilesTest()
        {
            string[] output = FileHelper.GetAllReportFiles();
        }

        [TestMethod()]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ParseHtmlFileTest()
        {
            string testPath = @"C:\Users\50264\source\repos\UCLBlueprintsV2\tprg\TestPerformanceReportGenerator\TestPerformanceReportGenerator\Resources\OverviewTemplate.html";
            var output = FileHelper.ParseHtmlFile(testPath);
        }
    }
}