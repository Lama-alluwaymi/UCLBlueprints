namespace CodeQualityReportGen.Utilities
{
    /// <summary>
    /// Stores code metrics and test quality data necessary to generate code quality overview reports.
    /// </summary>
    public class OverviewQualitytData
    {
        public string Maintainability { get; set; }
        public string CyclomaticComplexity { get; set; }
        public string DepthInheritance { get; set; }
        public string ClassCoupling { get; set; }
        public string LineCoverage { get; set; }
        public string TotalTestCases { get; set; }
        public string ProjectName { get; set; }
        public string ReportDate { get; set; }
    }
}
