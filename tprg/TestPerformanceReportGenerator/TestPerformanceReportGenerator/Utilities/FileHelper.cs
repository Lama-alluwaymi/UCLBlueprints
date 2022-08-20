using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

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
    }
}
