using System.Diagnostics;
using System.Text;
using System.Linq;
using System.IO;

namespace CodeQualityReportGen.Utilities
{
    public class TestAutoRunner
    {
        private string output;
        private string errorOut;
        public string passedTest;
        public string skippedTest;
        public string failedTest;
        public string duration;
        public string totalTests;

        private string findSubString(string target)
        {
            int targetIndex = this.output.IndexOf(target);
            int len;
            string substr;
            if (targetIndex != -1)
            {
                if (target.Equals("Duration:"))
                {
                    len = target.Length;
                    substr = this.output.Substring(targetIndex + len + 1, 5);
                    substr = substr.Replace("ms", "");
                    return substr;
                }
                len = target.Length;
                substr = this.output.Substring(targetIndex + len + 5, 2).Replace(",", "");
                // currently fetches only two digits, next step: find a way of fetching all the numbers 
                // such that if there are 100+ test cases it can fetch all the test cases.
                return substr;
            }
            return null;
        }

        public void runTestCases()
        {
            // Get the directory that contain the solution such that process can 
            // start in that directory
            DirectoryInfo directory = FileHelper.GetSolutionDir();
            if (directory != null)
            {
                // Set stringBuilders to fetch the output of the process
                StringBuilder outputString = new StringBuilder();
                StringBuilder errorString = new StringBuilder();

                // Start the process and call cmd.exe
                Process process = new Process();
                process.StartInfo.FileName = "cmd.exe";
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardInput = true;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.WorkingDirectory = directory.FullName;
                //Asynchronously process the process output
                process.OutputDataReceived += new DataReceivedEventHandler(
                    delegate (object sender, DataReceivedEventArgs e)
                    {
                        outputString.Append(e.Data);
                    }
                );
                process.ErrorDataReceived += new DataReceivedEventHandler(
                    delegate (object sender, DataReceivedEventArgs e)
                    {
                        errorString.Append(e.Data);
                    }
                );
                // start the process and run the dotnet test command
                process.Start();
                process.StandardInput.WriteLine("dotnet test");
                process.StandardInput.Flush();
                process.StandardInput.Close();

                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                process.WaitForExit();

                this.output = outputString.ToString();
                this.errorOut = errorString.ToString();

                // get the number of Passed, Failed, Skipped,
                this.passedTest = findSubString("Passed:");
                this.failedTest = findSubString("Failed:");
                this.skippedTest = findSubString("Skipped:");
                this.duration = findSubString("Duration:");
                this.totalTests = findSubString("Total:");
            }
            else
            {
                //Console.WriteLine("Could not find a directory with the current solution");
                VS.MessageBox.ShowError("Code Quality Report Generator", "Could not find directory containing current solution.");
            }

        }
    }
}