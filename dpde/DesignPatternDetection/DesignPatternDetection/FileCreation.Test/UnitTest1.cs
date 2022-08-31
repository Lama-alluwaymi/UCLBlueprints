using FileCreation.Service;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.IO;

namespace FileCreation.Test
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void CheckNullList()
        {
            var service = new FileCreationService();
            var result = service.WriteJsonData(null, "");
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void CheckEmptyList()
        {
            var service = new FileCreationService();
            var result = service.WriteJsonData(new List<PatternData>(), "");
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void CheckEmptyDirectory()
        {
            var service = new FileCreationService();
            var result = service.WriteJsonData(new List<PatternData>() { new PatternData() { Pattern = "test", totalCount = 1, Entries = new List<Entry>() } }, "");
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void GenerateJson()
        {
            var service = new FileCreationService();
            var result = service.WriteJsonData(new List<PatternData>() { new PatternData() { Pattern = "test", totalCount = 1, Entries = new List<Entry>() { new Entry() { FileName = "test", Line = 1 } } } }, Directory.GetCurrentDirectory());
            Assert.IsTrue(result);
        }

        [TestMethod]
        public void CheckNullListPdf()
        {
            var service = new FileCreationService();
            var result = service.WritePdfData(null, "");
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void CheckEmptyListPdf()
        {
            var service = new FileCreationService();
            var result = service.WritePdfData(new List<PatternData>(), "");
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void CheckEmptyDirectoryPdf()
        {
            var service = new FileCreationService();
            var result = service.WritePdfData(new List<PatternData>() { new PatternData() { Pattern = "test", totalCount = 1, Entries = new List<Entry>() } }, "");
            Assert.IsFalse(result);
        }

        [TestMethod]
        public void GeneratePdf()
        {
            var service = new FileCreationService();
            var result = service.WritePdfData(new List<PatternData>() { new PatternData() { Pattern = "test", totalCount = 1, Entries = new List<Entry>() { new Entry() } } }, Directory.GetCurrentDirectory());
            Assert.IsTrue(result);
        }
    }
}
