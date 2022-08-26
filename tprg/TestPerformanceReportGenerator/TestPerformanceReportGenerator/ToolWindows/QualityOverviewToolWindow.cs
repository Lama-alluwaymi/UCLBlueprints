using Microsoft.VisualStudio.Imaging;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace TestPerformanceReportGenerator
{
    public class QualityOverviewToolWindow : BaseToolWindow<QualityOverviewToolWindow>
    {
        public override string GetTitle(int toolWindowId) => "CQRG_overview";

        public override Type PaneType => typeof(Pane);

        public override Task<FrameworkElement> CreateAsync(int toolWindowId, CancellationToken cancellationToken)
        {
            return Task.FromResult<FrameworkElement>(new QualityOverviewToolWindowControl());
        }

        [Guid("7bda49d1-3062-4c71-9de5-956e509ee0b9")]
        internal class Pane : ToolWindowPane
        {
            public Pane()
            {
                BitmapImageMoniker = KnownMonikers.ToolWindow;
            }
        }
    }
}
