using System.Windows;
using System.Windows.Controls;
using System.Diagnostics;
using System.Text;
using System.IO;
using System.Linq;


namespace TestPerformanceReportGenerator
{
    public partial class MyToolWindowControl : UserControl
    {

        private string output;
        private string errorOut;
        private string passedTest;
        private string skippedTest;
        private string failedTest;
        private string duration;
        private string totalTests;

        public MyToolWindowControl()
        {
            InitializeComponent();
        }
        /// <summary>
        /// Gets the directory information of the directory containing the
        /// .sln solution file.
        /// </summary>
        /// <param name="currentPath">Current working directory path</param>
        /// <returns>DirectoryInfo object of the directory containing the solution</returns>
        private static DirectoryInfo getSolutionDir(string currentPath = null)
        {
            var directory = new DirectoryInfo(currentPath ?? Directory.GetCurrentDirectory());
            while (directory != null && !directory.GetFiles("*.sln").Any())
            {
                directory = directory.Parent;
            }
            return directory;
        }
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
                    return substr;
                }
                len = target.Length;
                substr = this.output.Substring(targetIndex + len + 5, 1);
                return substr;
            }
            return null;            
        }
        /// <summary>
        /// Automatically run all the test cases of a program and store its output
        /// 
        /// Currently just tested on Unit tests.
        /// </summary>
        private void runTestCases()
        {
            // Get the directory that contain the solution such that process can 
            // start in that directory
            DirectoryInfo directory = getSolutionDir();
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
                VS.MessageBox.ShowError("Test Performance Report Generator", "Could not find directory containing current solution.");
            }

        }

        /// <summary>
        /// Function that is executed when button1 has been clicked.
        /// </summary>
        /// <param name="sender"></param>6
        /// <param name="e"></param>
        private void button1_Click(object sender, RoutedEventArgs e)
        {
            runTestCases();
            total.Content = "Total Tests: " + this.totalTests;
            passed.Content = "Passed Tests: " + this.passedTest + "/" + this.totalTests; 
            failed.Content = "Failed Tests: " + this.failedTest + "/" + this.totalTests;
            skipped.Content = "Skipped Tests: " + this.skippedTest + "/" + this.totalTests;
            totduration.Content = "Duration: " + this.duration;

            //VS.MessageBox.Show("Test Performance Report Generator", this.output);
            
        }
    }
}