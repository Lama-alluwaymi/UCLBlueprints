using System.Windows;
using System.Windows.Controls;
using Microsoft.VisualStudio.Imaging;
using TestPerformanceReportGenerator.Utilities;
using System.IO;

namespace TestPerformanceReportGenerator
{
    public partial class DataOverviewToolWindowControl : UserControl
    {
        public DataOverviewToolWindowControl()
        {
            InitializeComponent();
        }

        /// <summary>
        /// Generate Overview report button event handler.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void button1_Click(object sender, RoutedEventArgs e)
        {
            // set info bar model
            var model = new InfoBarModel(
                new[]
                {
                    new InfoBarTextSpan("Project's Code Quality Overview Report Successfully Generated.")
                },
                KnownMonikers.CheckAdd,
                true
                );
            // Generate report async
            ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
            {
                InfoBar infobar = await VS.InfoBar.CreateAsync(PackageGuids.DataOverviewToolWindowString, model);

                await Task.Run(async () =>
                {
                    try
                    {
                        ReportGenerator.GenerateOverview();
                    }
                    catch (DirectoryNotFoundException e)
                    {
                        await VS.MessageBox.ShowErrorAsync("CodeQualityReportGen", "Cannot generate overview report because there are no code quality reports generated.");
                    }

                });

                await infobar.TryShowInfoBarUIAsync();
            }).FireAndForget();

            //VS.MessageBox.Show("QualityOverviewToolWindowControl", "Button clicked");
        }
    }
}
