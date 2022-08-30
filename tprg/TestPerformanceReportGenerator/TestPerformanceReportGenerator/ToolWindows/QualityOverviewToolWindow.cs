using Microsoft.VisualStudio.Imaging;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace TestPerformanceReportGenerator
{
    public class QualityOverviewToolWindow : BaseToolWindow<QualityOverviewToolWindow>
    {
        public override string GetTitle(int toolWindowId) => "CodeQualityReportGen_Overview";

        public override Type PaneType => typeof(Pane);

        public override Task<FrameworkElement> CreateAsync(int toolWindowId, CancellationToken cancellationToken)
        {
            return Task.FromResult<FrameworkElement>(new QualityOverviewToolWindowControl());
        }

        [Guid("f7bb0d1b-322c-4f43-9a1e-30e9981b89ce")]
        internal class Pane : ToolWindowPane
        {
            public Pane()
            {
                BitmapImageMoniker = KnownMonikers.ToolWindow;
            }
        }
    }
}
