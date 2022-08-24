using System.Windows;
using System.Windows.Controls;
using TestPerformanceReportGenerator.Utilities;
using Microsoft.VisualStudio.Imaging;


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
        /// Run test button click event handler.
        /// </summary>
        /// <param name="sender"></param>6
        /// <param name="e"></param>
        private void button1_Click(object sender, RoutedEventArgs e)
        {
            // Auto run tests asynchronousely such that it won't block IDE's UI
            ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
            {
                // Show progress in the IDE's status bar
                VS.StatusBar.ShowMessageAsync("Running Test Cases").FireAndForget();
                VS.StatusBar.StartAnimationAsync(StatusAnimation.General).FireAndForget();
                // Run "autorun Test case" function and display in the tool window
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
                //Update status bar
                VS.StatusBar.EndAnimationAsync(StatusAnimation.General).FireAndForget();
                VS.StatusBar.ShowMessageAsync("Test Run Completed").FireAndForget();
            }).FireAndForget();

        }

        /// <summary>
        /// Checkbox event handler for checkbox when checked
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void autoRunChecked(object sender, RoutedEventArgs e)
        {
            //enable autorun button and hide inputs.
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

        /// <summary>
        /// Checkbox event handler for checkbox when unchecked
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void autoRunUnchecked(object sender, RoutedEventArgs e)
        {
            // disable autorun button and enable all inputs
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

        /// <summary>
        /// Generate report button click event handler
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void submitData_Click(object sender, RoutedEventArgs e)
        {
            // set the info bar model to show up when report is generated
            var model = new InfoBarModel(
                new[]
                {
                    new InfoBarTextSpan("Report Successfully Generated")
                },
                KnownMonikers.CheckAdd,
                true
                );
            // Check if all inputs are not empty
            if (!maintainabilityInput.Text.Equals("") && !cyclomaticInput.Text.Equals("") &&
                !depthInheritanceInput.Text.Equals("") && !classCouplingInput.Text.Equals("") &&
                !loscInput.Text.Equals("") && !loecInput.Text.Equals(""))
            {
                this.maintainInputTxt = maintainabilityInput.Text;
                this.cycloInputTxt = cyclomaticInput.Text;
                this.depthOfInputTxt = depthInheritanceInput.Text;
                this.classCInputTxt = classCouplingInput.Text;
                this.loscInputTxt = loscInput.Text;
                this.loecInputTxt = loecInput.Text;

                // Run the generate report function asynchronously such that it won't block the UI
                ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
                {
                    InfoBar infobar = await VS.InfoBar.CreateAsync("{ce2a0f92-d094-48c5-be02-b8624558136a}", model);
                    await Task.Run(() =>
                    {
                        // get project name
                        //string projectName = Assembly.GetCallingAssembly().GetName().Name;
                        //string projectName = Assembly.GetExecutingAssembly().FullName.Split(',')[0];
                        string projectName = TestAutoRunner.GetSolutionName();

                        ReportGenerator.GenerateReport(projectName, this.generator.dataList,
                                                        this.maintainInputTxt, this.cycloInputTxt,
                                                        this.depthOfInputTxt, this.classCInputTxt,
                                                        this.loscInputTxt, this.loecInputTxt);
                    });
                    // Show infobar when report is generated
                    await infobar.TryShowInfoBarUIAsync();
                    // Clearing all input after report generation
                    ClearQualityInputs();
                    
                }).FireAndForget();
            }
        }

        /// <summary>
        /// Add test data button click event handler
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void addTestDataBtn_Click(object sender, RoutedEventArgs e)
        {
            // set the infobar model to show up when the test run has been added
            var model = new InfoBarModel(
                    new[]{
                        new InfoBarTextSpan("Test run successfully added to the report.")
                    },
                    KnownMonikers.AddAttachment,
                    true);

            //check if autorun test case is enabled
            if (chk_manual.IsChecked == true)
            {
                // check if autorun test case has been performed
                if (!total.Content.Equals("") && !passed.Content.Equals("") && !failed.Content.Equals("")
                    && !skipped.Content.Equals("") && !totduration.Content.Equals("") && !coverageInput.Text.Equals(""))
                {
                    this.coverageInputTxt = coverageInput.Text;
                    // add test run data asynchronously
                    ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
                    {
                        InfoBar infobar = await VS.InfoBar.CreateAsync("{ce2a0f92-d094-48c5-be02-b8624558136a}", model);
                        await Task.Run(() =>
                        {
                            // Get current date
                            string dateNow = SystemInfoRetriver.GetCurrentDate();
                            // Get the project version
                            string version = SystemInfoRetriver.GetProductVersion();
                            // Get hardware info of the user
                            string hardwareInfo = SystemInfoRetriver.GetHardwareInfo();
                            string dur = this.autoRunner.duration.Replace("ms", "");
                            this.generator.AddTestData(dateNow, version, hardwareInfo, this.autoRunner.failedTest, this.autoRunner.passedTest,
                                                    this.autoRunner.totalTests, this.coverageInputTxt, dur, this.autoRunner.skippedTest);
                        });
                        // show info bar when data has been added
                        await infobar.TryShowInfoBarUIAsync();
                        ClearTestInputs();
                        //Turn generate report button on
                        submitData.IsEnabled = true;
                    }).FireAndForget();
                }
                else
                {
                    VS.MessageBox.ShowError("Code Quality Report Generator", "Click 'Run Test!' button to run the test first.");
                }
            }
            //If user manually enters data
            else
            {
                // check all entry fields are not empty
                if(!failedTestInput.Text.Equals("") && !passedTestInput.Text.Equals("") && !skippedTestInput.Text.Equals("")
                    && !totalTestInput.Text.Equals("") && !durationInput.Text.Equals("") && !coverageInput.Text.Equals(""))
                {
                    this.failedInputTxt = failedTestInput.Text;
                    this.passedInputTxt = passedTestInput.Text;
                    this.totaltestInputTxt = totalTestInput.Text;
                    this.skippedInputTxt = skippedTestInput.Text;
                    this.durationInputTxt = durationInput.Text;
                    this.coverageInputTxt = coverageInput.Text;

                    ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
                    {
                        InfoBar infobar = await VS.InfoBar.CreateAsync("{ce2a0f92-d094-48c5-be02-b8624558136a}", model);
                        await Task.Run(() =>
                        {
                            // Get date
                            string dateNow = SystemInfoRetriver.GetCurrentDate();
                            // Get project version
                            string version = SystemInfoRetriver.GetProductVersion();
                            // Get user hardware info
                            string hardwareInfo = SystemInfoRetriver.GetHardwareInfo();
                            this.generator.AddTestData(dateNow, version, hardwareInfo, this.failedInputTxt, this.passedInputTxt,
                                this.totaltestInputTxt, this.coverageInputTxt, this.durationInputTxt, this.skippedInputTxt);

                        });
                        await infobar.TryShowInfoBarUIAsync();
                        ClearTestInputs();
                        //Turn generate report button on
                        submitData.IsEnabled = true;
                    }).FireAndForget();
                }
                else
                {
                    VS.MessageBox.ShowError("Code Quality Report Generator", "Please provide all the input in the form");
                }

            }
        }
        /// <summary>
        /// Helper method to clear all input when test run data has been added to report
        /// </summary>
        private void ClearTestInputs()
        {
            failedTestInput.Clear();
            passedTestInput.Clear();
            totalTestInput.Clear();
            coverageInput.Clear();
            durationInput.Clear();
            skippedTestInput.Clear();
            total.Content = String.Empty;
            passed.Content = String.Empty;
            failed.Content = String.Empty;
            skipped.Content = String.Empty;
            totduration.Content = String.Empty;
        }

        /// <summary>
        /// Helper method to clear all input when report has generated.
        /// </summary>
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