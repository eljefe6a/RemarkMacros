// Processes and includes all files in the class.json
// 
// Also processes the ![:includemodule] macro
// Can be used with ![:includemodule path/to/module.md]

var SourceCreator = function () {
};

// Downloads the sourceUrls and returns the results in Remark format
SourceCreator.prototype.createSource = function(classJSONUrl) {
  return createSource(classJSONUrl, false)
}

// Downloads the sourceUrls and returns the results in Remark format
SourceCreator.prototype.createSource = function(classJSONUrl, showChapters) {
  // Download class file
  classfile = this.getFile(classJSONUrl)
  classJSON = JSON.parse(classfile)

  // Set the class title
  document.title = classJSON.classname

  var source = ""

  // Add all modules for the class
  for (var i = 0; i < classJSON.classmodules.length; i++) {
    fileSource = this.getFile(classJSON.classmodules[i]);

    if (showChapters == true) {
      source += this.addChapterOrSectionList(fileSource)
    }

    source += this.importModule(fileSource, classJSON.classmodules[i])

    // Files shouldn't have --- at the head or foot
    // It is added automatically here
    if (i + 1 < classJSON.classmodules.length) {
      source += "\n---\n"
    }
  };

  return source
}

SourceCreator.prototype.importModule = function(fileSource, moduleFileName) {
  // Import any includemodule
  var m;
  var re = /!\[:includemodule (.*)\]\n/;

  // Keep on running Regex until all includemodule are replaced
  // with their module contents
  while ((m = re.exec(fileSource)) !== null) {
    fileSource = fileSource.replace(m[0], this.getFile(m[1]))

    console.log("Importing module: " + m[1] + " for " + moduleFileName)
  }

  return fileSource
}

SourceCreator.prototype.addChapterOrSectionList = function(fileSource) {
  // Add the chapters macro
  var m;
  var re = /template:\s+chapter\nname:\s+(.*)\n/;

  if ((m = re.exec(fileSource)) !== null) {
    source = "\ntemplate: chapterorsectionlist\n"
    source += "name: Course Chapters\n"
    source += "![:showchapters " + m[1] + "]\n"
    source += "---\n"

    return source;
  }

  return ""
}

SourceCreator.prototype.getFile = function(url) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open('GET', url, false);
  xmlhttp.send();

  if (xmlhttp.status != 200) {
    console.log(url + " could not be found and added to source.")
    return ""
  }

  return xmlhttp.responseText;
}
