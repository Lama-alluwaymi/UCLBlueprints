# Code Quality Report Generator
A Visual Studio extension that helps developers to produce code quality reports that include code metrics values, test run results and line coverage of the working project.
The extension is capable of producing two types of code quality report:  
- Basic ("daily") reports: user can generate one basic report per day, this report will include all the registered test runs that are performed in that day and the code metrics values of the final source code of the day.  
- Overview report: user can generate only one overview report, this report will show a progress of all code metrics values, test case number and line coverage fetched from all basic reports.  

All the generated reports are stored in the directory containing the solution (.sln) file:  
- Basic ("daily") reports are stored in the automatically generated `/Reports` subdirectory.
- Overview report is stored in the automatically generated `/Overview_Report` subdirectory.
## Installation instruction 
The extension is named as **CodeQualityReportGen**, you can install the extension from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=UCLBlueprints.CQRG) or from the Manage Extensions dialog box in Visual Studio.  
To install the **CodeQualityReportGen** extension within Visual Studio follow:  
1. From Extensions > Manage Extensions
2. Seach in the Search window for "CodeQualityReportGen"
3. Select `download`.
