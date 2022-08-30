using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using CodeQualityReportGen.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeQualityReportGen.Utilities.Tests
{
    [TestClass()]
    public class FileHelperTests
    {
        [TestMethod()]
        public void getSolutionDirTest()
        {
            string expected = @"C:\Users\50264\source\repos\UCLBlueprints\tprg\CodeQualityReportGen";
            var directory = FileHelper.GetSolutionDir();
            Assert.IsTrue(directory.GetType() == typeof(DirectoryInfo));
            Assert.AreEqual(directory.FullName, expected);
        }

        [TestMethod()]
        public void GetSolutionNameTest()
        {
            string expected = "CodeQualityReportGen";
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
            string testPath = @"C:\Users\50264\source\repos\UCLBlueprints\tprg\CodeQualityReportGen\CodeQualityReportGen\Resources\OverviewTemplate.html";
            var output = FileHelper.ParseHtmlFile(testPath);
        }
    }
}