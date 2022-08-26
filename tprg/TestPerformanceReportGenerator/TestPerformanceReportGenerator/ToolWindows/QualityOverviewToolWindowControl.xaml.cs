using System.Windows;
using System.Windows.Controls;

namespace TestPerformanceReportGenerator
{
    public partial class QualityOverviewToolWindowControl : UserControl
    {
        public QualityOverviewToolWindowControl()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, RoutedEventArgs e)
        {
            VS.MessageBox.Show("QualityOverviewToolWindowControl", "Button clicked");
        }
    }
}
