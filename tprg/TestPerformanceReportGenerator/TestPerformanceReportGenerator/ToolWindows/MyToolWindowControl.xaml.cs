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

        public MyToolWindowControl()
        {
            InitializeComponent();
        }

        private static DirectoryInfo GetSolutionDir(string currentPath = null)
        {
            var directory = new DirectoryInfo(currentPath ?? Directory.GetCurrentDirectory());
            while (directory != null && !directory.GetFiles("*.sln").Any())
            {
                directory = directory.Parent;
            }
            return directory;
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
            DirectoryInfo directory = GetSolutionDir();
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
            }
            else
            {
                Console.WriteLine("Could not find a directory with the current solution");
            }

        }

        /// <summary>
        /// Function that is executed when button1 has been clicked.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void button1_Click(object sender, RoutedEventArgs e)
        {
            runTestCases();
            VS.MessageBox.Show("TestPerformanceReportGenerator", this.output);
            
        }
    }
}