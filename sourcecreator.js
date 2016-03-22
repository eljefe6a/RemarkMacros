// Processes and includes all files in the class.json
// 
// Also processes the ![:includemodule] macro
// Can be used with ![:includemodule path/to/module.md]

var SourceCreator = function () {
};

// Downloads the sourceUrls and returns the results in Remark format
SourceCreator.prototype.createSource = function(classJSONUrl, callbackfunction) {
  return createSource(classJSONUrl, false)
}

// Downloads the sourceUrls and calls the second step
SourceCreator.prototype.createSource = function(classJSONUrl, callbackfunction, showChapters) {
  // Download class file
  this.getFile(classJSONUrl, function(classfile) {
    classJSON = JSON.parse(classfile)

    // Set the class title
    document.title = classJSON.classname

    classJSON.ajaxCall = []

    // Download all modules
    for (var i = 0; i < classJSON.classmodules.length; i++) {
      classJSON.ajaxCall[i] = $.ajax({
      url: classJSON.classmodules[i],
      cache: false
      })
    }

    // Add all modules for the class
    $.when.apply($, classJSON.ajaxCall).done(function() {
      SourceCreator.prototype.downloadAllModules(classJSON, callbackfunction, showChapters)
    })
  })
}

// Second step that goes through and downloads all modules.
SourceCreator.prototype.downloadAllModules = function(classJSON, callbackfunction, showChapters) {
  allModuleAjaxCalls = []
  classJSON.modules = {}

  for (var i = 0; i < classJSON.classmodules.length; i++) {
    fileSource = classJSON.ajaxCall[i].responseText
    
    // Concat that module's Ajax calls together
    ajaxCalls = SourceCreator.prototype.downloadModule(classJSON, fileSource, classJSON.classmodules[i])
    allModuleAjaxCalls = allModuleAjaxCalls.concat(ajaxCalls)
  }

  $.when.apply($, allModuleAjaxCalls).done(function() {
    SourceCreator.prototype.finalizeSource(classJSON, callbackfunction, showChapters)
  })
}

// Goes through all source and downloads the modules.
SourceCreator.prototype.downloadModule = function(classJSON, fileSource, moduleFileName) {
  // Import any includemodule
  var m;
  var re = /!\[:includemodule (.*)\]\n/g;

  ajaxCalls = []
  
  classJSON.modules[moduleFileName] = {}
  classJSON.modules[moduleFileName].file = {}

  // Keep on running Regex until all includemodule are found
  while ((m = re.exec(fileSource)) !== null) {
    ajaxCall = $.ajax({
    url: m[1],
    cache: false
    })
    ajaxCalls.push(ajaxCall)
    classJSON.modules[moduleFileName].file[m[1]] = ajaxCall;

    console.log("Importing module: " + m[1] + " for " + moduleFileName)
  }

  return ajaxCalls
}

// The final step in the callback hell. Adds modules.
SourceCreator.prototype.finalizeSource = function(classJSON, callbackfunction, showChapters) {
  var source = ""

  for (var i = 0; i < classJSON.classmodules.length; i++) {
    fileSource = classJSON.ajaxCall[i].responseText

    if (showChapters == true) {
      source += SourceCreator.prototype.addChapterOrSectionList(fileSource)
    }

    source += SourceCreator.prototype.importModule(fileSource, classJSON.classmodules[i], classJSON)

    // Files shouldn't have --- at the head or foot
    // It is added automatically here
    if (i + 1 < classJSON.classmodules.length) {
      source += "\n---\n"
    }
  }

  // All modules downloaded, callback to function that we're done
  callbackfunction(source)
}

// Now that file is downloaded, replaces includemodule with the module
SourceCreator.prototype.importModule = function(fileSource, moduleFileName, classJSON) {
  // Import any includemodule
  var m;
  var re = /!\[:includemodule (.*)\]\n/;

  // Keep on running Regex until all includemodule are replaced
  // with their module contents
  while ((m = re.exec(fileSource)) !== null) {
    fileSource = fileSource.replace(m[0], classJSON.modules[moduleFileName].file[m[1]].responseText)
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

SourceCreator.prototype.getFile = function(url, callbackfunction) {
  var jqxhr = $.ajax({
  url: url,
  cache: false
  })
  .done(function() {
    callbackfunction(jqxhr.responseText)
  })
  .fail(function() {
    console.log(url + " could not be found and added to source. Status code:" + 
      xmlhttp.status + " Response:\n\"" + xmlhttp.responseText + "\"")
  });
}
