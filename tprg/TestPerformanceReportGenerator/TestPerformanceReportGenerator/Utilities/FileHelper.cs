using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using HtmlAgilityPack;
using System.Xml;

namespace TestPerformanceReportGenerator.Utilities
{
    public class FileHelper
    {
        public static string ReadFile(string filePath)
        {
            try
            {
                if (File.Exists(filePath))
                {
                    string txt = File.ReadAllText(filePath);
                    byte[] bytes = Encoding.UTF8.GetBytes(txt);
                    string str = Encoding.UTF8.GetString(bytes);
                    return str;

                }
                else
                {
                    return null;
                }
            }catch(Exception e)
            {
                return e.Message;
            }
        }

        public static string ReadFromResource(string resourceName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            using(StreamReader sr = new StreamReader(stream))
            {
                return sr.ReadToEnd();
            }
        }
        public static DirectoryInfo getSolutionDir(string currentPath = null, string fileExt = "*.sln")
        {
            var directory = new DirectoryInfo(currentPath ?? Directory.GetCurrentDirectory());
            while (directory != null && !directory.GetFiles(fileExt).Any())
            {
                directory = directory.Parent;
            }
            return directory;
        }

        public static string GetSolutionName() => getSolutionDir().FullName.Split('\\').Last().Replace(".sln", "");

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

        public static string[] GetAllReportFiles()
        {
            string path = Path.Combine(getSolutionDir().FullName, "Reports");
            if (Directory.Exists(path))
            {
                return Directory.GetFiles(path);
            }
            else
            {
                throw new DirectoryNotFoundException();
            }
        }

        public static OverviewQualitytData ParseHtmlFile(string filePath)
        {
            if (File.Exists(filePath))
            {
                var doc = new HtmlDocument();
                doc.Load(filePath);
                // Get all values from 
                var maintain_val = doc.DocumentNode.SelectSingleNode("//div[@id='maintain_val']");
                var cyclo_val = doc.DocumentNode.SelectSingleNode("//span[@id='cyclo_val']");
                var inherit_val = doc.DocumentNode.SelectSingleNode("//span[@id='inherit_val']");
                var classcoup_val = doc.DocumentNode.SelectSingleNode("//span[@id='classcoup_val']");
                var line_cov = doc.DocumentNode.SelectNodes("//td[@id='line_cov']").Last();
                var tot_testcase = doc.DocumentNode.SelectNodes("//td[@id='tot_testcase']").Last();

                // store all values in an object
                OverviewQualitytData data = new OverviewQualitytData()
                {
                    Maintainability = maintain_val.InnerText,
                    CyclomaticComplexity = cyclo_val.InnerText,
                    DepthInheritance = inherit_val.InnerText,
                    ClassCoupling = classcoup_val.InnerText,
                    LineCoverage = line_cov.InnerText,
                    TotalTestCases = tot_testcase.InnerText,
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
