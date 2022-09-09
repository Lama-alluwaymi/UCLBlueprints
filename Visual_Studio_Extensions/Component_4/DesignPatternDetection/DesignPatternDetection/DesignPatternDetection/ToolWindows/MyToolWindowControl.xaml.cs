using EnvDTE;
using EnvDTE80;
using FileCreation.Service;
using Microsoft;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;

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
            CreateFileService = new FileCreationService();
        }

        private List<string> AvailablePatterns = new List<string>() { "SINGLETON","FACTORY","ABSTRACTFACTORY", "BUILDER", "PROTOTYPE", "ADAPTER",
        "COMPOSITE", "PROXY", "FLYWEIGHT", "FACADE", "BRIDGE", "DECORATOR", "TEMPLATEMETHOD", "MEDIATOR", "OBSERVER", "STRATEGY", "COMMAND", "STATE", "VISITOR", "ITERATOR",
        "INTERPRETER", "MEMENTO", "CHAINOFRESPONSIBILITY"};

        public FileCreationService CreateFileService { get; }

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
            List<PatternData> patterns = new List<PatternData>();
            // check if patterns.json exist
            if (appendJson.IsChecked.HasValue && appendJson.IsChecked.Value && File.Exists($"{directory}\\patterns.json"))
            {
                var existingData = System.IO.File.ReadAllText($"{directory}\\patterns.json");
                // De-serialize to object or create new list
                var patternDataList = JsonSerializer.Deserialize<List<PatternData>>(existingData);
                if (patternDataList.Any())
                {
                    patterns.AddRange(patternDataList);
                }
            }

            var allFiles = Directory.GetFiles(directory, "*.*", SearchOption.AllDirectories).Where(filename => !(filename.ToLower().Contains("\\bin\\") ||
            filename.ToLower().Contains("\\debug\\") || filename.ToLower().Contains("\\release\\") || filename.ToLower().Contains("\\obj\\") || filename.ToLower().Contains("patterns.json")));
            // avoid all the bin and debug folder files 
            foreach (string file in allFiles)
            {
                int count = 0;
                foreach (string line in File.ReadLines(file))
                {
                    count++;
                    if (line.ToUpper().Contains($"@{pattern.Text.ToUpper().Trim()}"))
                    {
                        var currentPattern = patterns.FirstOrDefault(t => t.Pattern.Equals(pattern.Text.ToLower().Trim()));
                        if (currentPattern != null)
                        {
                            currentPattern.Entries.Add(new Entry() { FileName = file, Line = count });
                            currentPattern.totalCount++;
                        }
                        else
                        {
                            patterns.Add(new PatternData() { Pattern = pattern.Text.ToLower().Trim(), totalCount = 1, Entries = new List<Entry> { new Entry() { FileName = file, Line = count } } });
                        }
                    }
                }
            }

            if (!patterns.Any(t => t.Pattern.Equals(pattern.Text.Trim().ToLower(), StringComparison.InvariantCultureIgnoreCase)))
            {
                VS.MessageBox.Show($"No {pattern.Text.Trim().ToLower()} found in {directory}");
            }
            else
            {
                if (CreateFileService.WriteJsonData(patterns, directory))
                {
                    VS.MessageBox.Show($"Generated patterns.json in {directory}");
                }
                else
                {
                    VS.MessageBox.Show($"Error while generating json file");
                }

                var result = VS.MessageBox.Show($"Do you want to generate patterns.pdf?");
                if (result == Microsoft.VisualStudio.VSConstants.MessageBoxResult.IDOK)
                {
                    if (CreateFileService.WritePdfData(patterns, directory))
                    {
                        VS.MessageBox.Show($"Generated patterns.pdf in {directory}");
                    }
                    else
                    {
                        VS.MessageBox.Show($"Error while generating pdf file");
                    }
                }
            }
        }
    }
}