using Microsoft.VisualStudio.TestTools.UnitTesting;
using TestPerformanceReportGenerator.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestPerformanceReportGenerator.Utilities.Tests
{
    [TestClass()]
    public class ReportGeneratorTests
    {
        [TestMethod()]
        public void AddTestDataTest()
        {
            ReportGenerator generator = new ReportGenerator();
            generator.AddTestData("00:00:00", "1.0", "hardware", "3", "3", "6", "100", "120", "0");
            generator.AddTestData("00:00:00", "1.0", "hardware", "3", "3", "6", "100", "120", "0");
            Assert.AreEqual(2, generator.dataList.Count);
        }
    }
}