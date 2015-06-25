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
      // Add the chapters macro
      var m;
      var re = /template:\s+chapter\nname:\s+(.*)\n/;
 
      if ((m = re.exec(fileSource)) !== null) {
        source += "\ntemplate: chapterorsectionlist\n"
        source += "name: Course Chapters\n"
        source += "![:showchapters " + m[1] + "]\n"
        source += "---\n"
      }
    }

    source += fileSource

    // Files shouldn't have --- at the head or foot
    // It is added automatically here
    if (i + 1 < classJSON.classmodules.length) {
      source += "\n---\n"
    }
  };

  return source
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
