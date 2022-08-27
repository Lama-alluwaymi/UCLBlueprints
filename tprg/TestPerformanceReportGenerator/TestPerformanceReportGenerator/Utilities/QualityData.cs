
namespace TestPerformanceReportGenerator.Utilities
{
    public class QualityData
    {
        public string Date { get; set; }
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
