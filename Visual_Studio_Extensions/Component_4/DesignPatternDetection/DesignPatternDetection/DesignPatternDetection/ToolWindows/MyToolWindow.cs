using System.Runtime.InteropServices;

namespace DesignPatternDetection
{
    /// <summary>
    /// This class implements the tool window exposed by this package and hosts a user control.
    /// </summary>
    /// <remarks>
    /// In Visual Studio tool windows are composed of a frame (implemented by the shell) and a pane,
    /// usually implemented by the package implementer.
    /// <para>
    /// This class derives from the ToolWindowPane class provided from the MPF in order to use its
    /// implementation of the IVsUIElementPane interface.
    /// </para>
    /// </remarks>
    [Guid("e6c75ea4-09c5-4e32-bc0b-e221277993c1")]
    public class MyToolWindow : ToolWindowPane
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="MyToolWindow"/> class.
        /// </summary>
        public MyToolWindow() : base(null)
        {
            this.Caption = "MyToolWindow";

            // This is the user control hosted by the tool window; Note that, even if this class implements IDisposable,
            // we are not calling Dispose on this object. This is because ToolWindowPane calls Dispose on
            // the object returned by the Content property.
            this.Content = new MyToolWindowControl();
        }
    }
}
