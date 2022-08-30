using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using HtmlAgilityPack;
using System.Xml;


namespace TestPerformanceReportGenerator.Utilities
{
    /// <summary>
    /// Helper class for reading, writing and parsing specific files.
    /// </summary>
    public class FileHelper
    {
        //function deprecated
        //public static string ReadFile(string filePath)
        //{
        //    try
        //    {
        //        if (File.Exists(filePath))
        //        {
        //            string txt = File.ReadAllText(filePath);
        //            byte[] bytes = Encoding.UTF8.GetBytes(txt);
        //            string str = Encoding.UTF8.GetString(bytes);
        //            return str;

        //        }
        //        else
        //        {
        //            return null;
        //        }
        //    }catch(Exception e)
        //    {
        //        return e.Message;
        //    }
        //}

        /// <summary>
        /// Reads the specified file from assembly using the specified manifest resource.
        /// </summary>
        /// <param name="resourceName">Manifest resouce string. Format: ProjectNamespace.ResourceFile</param>
        /// <returns>The entire resource file as a string.</returns>
        public static string ReadFromResource(string resourceName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            using(StreamReader sr = new StreamReader(stream))
            {
                return sr.ReadToEnd();
            }
        }

        /// <summary>
        /// Retrives DirectoryInfo object of the directory containing .sln (solution) file.
        /// </summary>
        /// <param name="currentPath">Specifies the path to start with.</param>
        /// <param name="fileExt">Specifies the file extension to search for.</param>
        /// <returns>A DirectoryInfo object of the directory that contains the file.</returns>
        public static DirectoryInfo GetSolutionDir(string currentPath = null, string fileExt = "*.sln")
        {
            var directory = new DirectoryInfo(currentPath ?? Directory.GetCurrentDirectory());
            while (directory != null && !directory.GetFiles(fileExt).Any())
            {
                directory = directory.Parent;
            }
            return directory;
        }

        /// <summary>
        /// Gets the solution name.
        /// </summary>
        /// <returns>Solution name</returns>
        public static string GetSolutionName() => GetSolutionDir().FullName.Split('\\').Last().Replace(".sln", "");

        /// <summary>
        /// Write specified report string to a specified path
        /// </summary>
        /// <param name="report">The report content that needs to be written</param>
        /// <param name="path">File path where the report file is going to be generated</param>
        /// <param name="isClearedOldText">Overwrite existing text. Default value = true.</param>
        public static void WriteFile(string report, string path, bool isClearedOldText = true)
        {
            if (isClearedOldText)
            {
                using(FileStream stream = File.Open(path, FileMode.OpenOrCreate, FileAccess.Write))
                {
                    stream.Seek(0, SeekOrigin.Begin);
                    stream.SetLength(0);
                }
            }

            using(StreamWriter writer = new StreamWriter(path, true))
            {
                writer.WriteLine(report);
            }
        }

        /// <summary>
        /// Gets all files (and paths to file) inside the directory "PathToSolutionDirectory/Reports".
        /// </summary>
        /// <returns>An array of file paths inside the Reports directory</returns>
        /// <exception cref="DirectoryNotFoundException"></exception>
        public static string[] GetAllReportFiles()
        {
            string path = Path.Combine(GetSolutionDir().FullName, "Reports");
            if (Directory.Exists(path))
            {
                return Directory.GetFiles(path);
            }
            else
            {
                throw new DirectoryNotFoundException();
            }
        }

        /// <summary>
        /// Parse the specified html file and store the necessary data into an OverviewQualityData object
        /// </summary>
        /// <param name="filePath">Path to the HTML file</param>
        /// <returns>an OverviewQualityData object</returns>
        /// <exception cref="FileNotFoundException"></exception>
        public static OverviewQualitytData ParseHtmlFile(string filePath)
        {
            if (File.Exists(filePath))
            {
                var doc = new HtmlDocument();
                doc.Load(filePath);
                // Get report basic data
                var project_name = doc.DocumentNode.SelectSingleNode("//div[@id='ProjectName']");
                var report_date = doc.DocumentNode.SelectSingleNode("//div[@id='ReportDate']");
                // Get all code metrics value
                var maintain_val = doc.DocumentNode.SelectSingleNode("//div[@id='maintain_val']");
                var cyclo_val = doc.DocumentNode.SelectSingleNode("//span[@id='cyclo_val']");
                var inherit_val = doc.DocumentNode.SelectSingleNode("//span[@id='inherit_val']");
                var classcoup_val = doc.DocumentNode.SelectSingleNode("//span[@id='classcoup_val']");
                // Get the last entry of Line coverage and total number of test cases
                var line_cov = doc.DocumentNode.SelectNodes("//td[@id='line_cov']").Last();
                var tot_testcase = doc.DocumentNode.SelectNodes("//span[@id='tot_testcases']").Last();

                string tot = tot_testcase.InnerText.Split('/').Last();
                string maintain = maintain_val.InnerText.Replace("%", "");
                string lcov = line_cov.InnerText.Replace("%", "");
                // store all values in an object
                OverviewQualitytData data = new OverviewQualitytData()
                {
                    Maintainability = maintain,
                    CyclomaticComplexity = cyclo_val.InnerText,
                    DepthInheritance = inherit_val.InnerText,
                    ClassCoupling = classcoup_val.InnerText,
                    LineCoverage = lcov,
                    TotalTestCases = tot,
                    ProjectName = project_name.InnerText,
                    ReportDate = report_date.InnerText,
                };

                return data;
            }
            else
            {
                throw new FileNotFoundException();
            }

        }
    }
}
