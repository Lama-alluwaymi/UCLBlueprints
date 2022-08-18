using System.Windows;
using System.Windows.Controls;
using System.Diagnostics;
using System.Text;
using System.IO;
using System.Linq;
using TestPerformanceReportGenerator.Utilities;

namespace TestPerformanceReportGenerator
{
    public partial class MyToolWindowControl : UserControl
    {

        public MyToolWindowControl()
        {
            InitializeComponent();
        }

        /// <summary>
        /// Function that is executed when run test button has been clicked.
        /// </summary>
        /// <param name="sender"></param>6
        /// <param name="e"></param>
        private void button1_Click(object sender, RoutedEventArgs e)
        {
            ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
            {
                TestAutoRunner autoRunner = new TestAutoRunner();
                await Task.Run(() => autoRunner.runTestCases());
                total.Content = autoRunner.totalTests;
                passed.Content = autoRunner.passedTest + "/" + autoRunner.totalTests;
                failed.Content = autoRunner.failedTest + "/" + autoRunner.totalTests;
                skipped.Content = autoRunner.skippedTest + "/" + autoRunner.totalTests;
                totduration.Content = autoRunner.duration;
                total.Visibility = Visibility.Visible;
                passed.Visibility = Visibility.Visible;
                failed.Visibility = Visibility.Visible;
                skipped.Visibility = Visibility.Visible;
                totduration.Visibility = Visibility.Visible;
            }).FireAndForget();
        }

        /// <summary>
        /// Event handler for checkbox that will allow user to 
        /// manually enter the relevant data. It disables the button that
        /// automatically runs the test and will display all the input field.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void autoRunChecked(object sender, RoutedEventArgs e)
        {
            //setting some attributes of the xaml objects.
            autoTestBtn.IsEnabled = true;
            totalTestInput.Visibility = Visibility.Collapsed;
            passedTestInput.Visibility = Visibility.Collapsed;  
            failedTestInput.Visibility = Visibility.Collapsed;
            skippedTestInput.Visibility = Visibility.Collapsed;
            durationInput.Visibility = Visibility.Collapsed;
            total.Visibility = Visibility.Visible;
            passed.Visibility = Visibility.Visible;
            failed.Visibility = Visibility.Visible;
            skipped.Visibility = Visibility.Visible;
            totduration.Visibility = Visibility.Visible;

        }

        private void autoRunUnchecked(object sender, RoutedEventArgs e)
        {
            autoTestBtn.IsEnabled = false;
            totalTestInput.Visibility = Visibility.Visible;
            passedTestInput.Visibility = Visibility.Visible;
            failedTestInput.Visibility = Visibility.Visible;
            skippedTestInput.Visibility = Visibility.Visible;
            durationInput.Visibility = Visibility.Visible;
            total.Visibility = Visibility.Collapsed;
            passed.Visibility = Visibility.Collapsed;
            failed.Visibility = Visibility.Collapsed;
            skipped.Visibility = Visibility.Collapsed;
            totduration.Visibility = Visibility.Collapsed;
        }

        private void submitData_Click(object sender, RoutedEventArgs e)
        {
            VS.MessageBox.Show("TPRG", "create a submit function");
        }
    }
}