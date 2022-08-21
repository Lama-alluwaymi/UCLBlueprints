using System.Windows;
using System.Windows.Controls;
using System.Reflection;
using TestPerformanceReportGenerator.Utilities;

namespace TestPerformanceReportGenerator
{
    public partial class MyToolWindowControl : UserControl
    {

        private ReportGenerator generator = new ReportGenerator();
        private TestAutoRunner autoRunner = new TestAutoRunner();
        private string failedInputTxt;
        private string passedInputTxt;
        private string skippedInputTxt;
        private string durationInputTxt;
        private string coverageInputTxt;
        private string totaltestInputTxt;
        private string maintainInputTxt;
        private string cycloInputTxt;
        private string depthOfInputTxt;
        private string classCInputTxt;
        private string loscInputTxt;
        private string loecInputTxt;
        

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
                //TestAutoRunner autoRunner = new TestAutoRunner();
                await Task.Run(() => this.autoRunner.runTestCases());
                total.Content = this.autoRunner.totalTests;
                passed.Content = this.autoRunner.passedTest + "/" + this.autoRunner.totalTests;
                failed.Content = this.autoRunner.failedTest + "/" + this.autoRunner.totalTests;
                skipped.Content = this.autoRunner.skippedTest + "/" + this.autoRunner.totalTests;
                totduration.Content = this.autoRunner.duration;
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
            autoTestBtn.Visibility = Visibility.Visible;
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
            autoTestBtn.Visibility = Visibility.Collapsed;
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
            this.maintainInputTxt = maintainabilityInput.Text;
            this.cycloInputTxt = cyclomaticInput.Text;
            this.depthOfInputTxt = depthInheritanceInput.Text;
            this.classCInputTxt = classCouplingInput.Text;
            this.loscInputTxt = loscInput.Text;
            this.loecInputTxt = loecInput.Text;

            //VS.MessageBox.Show("//", this.autoRunner.passedTest);
            ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
            {
                await Task.Run(() =>
                {
                    string projectName = Assembly.GetCallingAssembly().GetName().Name;
                    ReportGenerator.GenerateReport(projectName, this.generator.dataList,
                                                    this.maintainInputTxt, this.cycloInputTxt,
                                                    this.depthOfInputTxt, this.classCInputTxt,
                                                    this.loscInputTxt, this.loecInputTxt);
                });
                // Clearing all input after report generation
                ClearQualityInputs();
            }).FireAndForget();
        }

        private void addTestDataBtn_Click(object sender, RoutedEventArgs e)
        {
            this.failedInputTxt = failedTestInput.Text;
            this.passedInputTxt = passedTestInput.Text;
            this.totaltestInputTxt = totalTestInput.Text;
            this.skippedInputTxt = skippedTestInput.Text;
            this.durationInputTxt = durationInput.Text;
            this.coverageInputTxt = coverageInput.Text;

            if (chk_manual.IsChecked == true)
            {
                if (!total.Content.Equals("") && !passed.Content.Equals("") && !failed.Content.Equals("")
                    && !skipped.Content.Equals("") && !totduration.Content.Equals("") && !coverageInput.Text.Equals(""))
                { 
                    ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
                    {
                        await Task.Run(() =>
                        {
                            // Get current Date
                            string dateNow = SystemInfoRetriver.GetCurrentDate();
                            string version = SystemInfoRetriver.GetProductVersion();
                            string hardwareInfo = SystemInfoRetriver.GetHardwareInfo();
                            string dur = this.autoRunner.duration.Replace("ms", "");
                            this.generator.AddTestData(dateNow, version, hardwareInfo, this.autoRunner.failedTest, this.autoRunner.passedTest,
                                                    this.autoRunner.totalTests, this.coverageInputTxt, dur, this.autoRunner.skippedTest);
                        });
                        ClearTestInputs();
                    }).FireAndForget();
                }
                else
                {
                    VS.MessageBox.Show("Code Quality Report Generator", "Click 'Run Test!' button to run the test first.");
                }
            }
            else
            {
                ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
                {
                    await Task.Run(() =>
                    {
                        string dateNow = SystemInfoRetriver.GetCurrentDate();
                        string version = SystemInfoRetriver.GetProductVersion();
                        string hardwareInfo = SystemInfoRetriver.GetHardwareInfo();
                        this.generator.AddTestData(dateNow, version, hardwareInfo, this.failedInputTxt, this.passedInputTxt,
                            this.totaltestInputTxt, this.coverageInputTxt, this.durationInputTxt, this.skippedInputTxt);

                    });
                    ClearTestInputs();
                }).FireAndForget();
            }
        }

        private void ClearTestInputs()
        {
            failedTestInput.Clear();
            passedTestInput.Clear();
            totalTestInput.Clear();
            coverageInput.Clear();
            durationInput.Clear();
            skippedTestInput.Clear();
        }

        private void ClearQualityInputs()
        {
            maintainabilityInput.Clear();
            cyclomaticInput.Clear();
            depthInheritanceInput.Clear();
            classCouplingInput.Clear();
            loscInput.Clear();
            loecInput.Clear();
        }
    }
}