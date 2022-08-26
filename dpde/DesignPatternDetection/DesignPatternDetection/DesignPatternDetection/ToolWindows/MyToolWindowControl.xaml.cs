using EnvDTE;
using EnvDTE80;
using Microsoft;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace DesignPatternDetection
{
    /// <summary>
    /// Interaction logic for MyToolWindowControl.
    /// </summary>
    public partial class MyToolWindowControl : UserControl
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="MyToolWindowControl"/> class.
        /// </summary>
        public MyToolWindowControl()
        {
            this.InitializeComponent();
        }

        private List<string> AvailablePatterns = new List<string>() { "SINGLETON","FACTORY","ABSTRACT FACTORY", "ABSTRACTFACTORY", "BUILDER", "PROTOTYPE"};

        /// <summary>
        /// Handles click on the button by displaying a message box.
        /// </summary>
        /// <param name="sender">The event sender.</param>
        /// <param name="e">The event args.</param>
        [SuppressMessage("Microsoft.Globalization", "CA1300:SpecifyMessageBoxOptions", Justification = "Sample code")]
        [SuppressMessage("StyleCop.CSharp.NamingRules", "SA1300:ElementMustBeginWithUpperCaseLetter", Justification = "Default event handler naming pattern")]
        private void Generate_Click(object sender, RoutedEventArgs e)
        {
            ThreadHelper.ThrowIfNotOnUIThread();
            var dte = ServiceProvider.GlobalProvider.GetService(typeof(DTE)) as DTE2;
            Assumes.Present(dte);
            var proj = dte.Solution.Projects.OfType<EnvDTE.Project>().FirstOrDefault();
            if (proj == null)
            {
                VS.MessageBox.Show("Please open any project");
                return;
            }
            var filename = proj.FullName;
            if (filename == null)
                return;
            string directory = Directory.GetParent(filename).FullName;
            if (string.IsNullOrEmpty(pattern.Text))
            {
                VS.MessageBox.Show("Please enter the pattern to search");
                return;
            }
            if (!AvailablePatterns.Contains(pattern.Text.Trim().ToUpper()))
            {
                VS.MessageBox.Show("Please enter a valid pattern to search");
                return;
            }
            VS.MessageBox.Show($"Searching for pattern {pattern.Text} in {directory}");
            // Pattern
            // FileName
            // List<Location>

           
            File.WriteAllText($"{directory}\\sample.json", "sample check");
        }
    }
}