using System.Windows;
using System.Windows.Controls;
using System;
using System.Diagnostics;
using System.Text;


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
        /// <summary>
        /// Automatically run all the test cases of a program and store its output
        /// 
        /// Currently just tested on Unit tests.
        /// </summary>
        private void runTestCases()
        {
            StringBuilder outputString = new StringBuilder();
            StringBuilder errorString = new StringBuilder();

            Process process = new Process();
            process.StartInfo.FileName = "cmd.exe";
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardInput = true;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;
            //process.StartInfo.WorkingDirectory = ""; write a function to check the working directory of the solution.


            //Asynchronously process the process output
            //process.OutputDataReceived += new DataReceivedEventHandler(
            //    delegate(object sender, DataReceivedEventArgs e)
            //    {
            //        outputString.Append(e.Data);
            //    }
            //);
            //process.ErrorDataReceived += new DataReceivedEventHandler(
            //    delegate(object sender, DataReceivedEventArgs e)
            //    {
            //        errorString.Append(e.Data);
            //    }
            //);

            process.OutputDataReceived += new DataReceivedEventHandler(OutputHandler);
            process.ErrorDataReceived += new DataReceivedEventHandler(ErrorHandler);
            process.Start();
            process.StandardInput.WriteLine("dotnet test");
            process.StandardInput.Flush();
            process.StandardInput.Close();

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            process.WaitForExit();

            //this.output = outputString.ToString();
            //this.errorOut = errorString.ToString();

        }
        private void OutputHandler(object sender, DataReceivedEventArgs e)
        {
            Console.WriteLine(e.Data);
        }

        private void ErrorHandler(object sender, DataReceivedEventArgs e)
        {
            Console.WriteLine(e.Data);
        }

        /// <summary>
        /// Function that is executed when button1 has been clicked.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void button1_Click(object sender, RoutedEventArgs e)
        {
            //VS.MessageBox.Show("TestPerformanceReportGenerator", "Button clicked");
            runTestCases();
        }
    }
}