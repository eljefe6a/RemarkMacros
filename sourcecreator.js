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
SourceCreator.prototype.createSource = function(classJSONUrl, callbackfunction, showChapters, showSections) {
  // Download class file
  this.getFile(classJSONUrl, function(classfile) {
    classJSON = JSON.parse(classfile)

    // Set the class title
    document.title = classJSON.classname

    classJSON.ajaxCall = []

    // Download all modules
    for (var i = 0; i < classJSON.classmodules.length; i++) {
      currentModule = classJSON.classmodules[i];

      classJSON.ajaxCall[i] = $.ajax({
      url: classJSON.classmodules[i].filename,
      cache: false
      })
    }

    // Add all modules for the class
    $.when.apply($, classJSON.ajaxCall).done(function() {
      SourceCreator.prototype.downloadAllModules(classJSON, callbackfunction, showChapters, showSections)
    })
  })
}

// Second step that goes through and downloads all modules.
SourceCreator.prototype.downloadAllModules = function(classJSON, callbackfunction, showChapters, showSections) {
  allModuleAjaxCalls = []
  classJSON.modules = {}

  for (var i = 0; i < classJSON.classmodules.length; i++) {
    fileSource = classJSON.ajaxCall[i].responseText
    
    // Concat that module's Ajax calls together
    ajaxCalls = SourceCreator.prototype.downloadModule(classJSON, fileSource, classJSON.classmodules[i].filename)
    allModuleAjaxCalls = allModuleAjaxCalls.concat(ajaxCalls)
  }

  $.when.apply($, allModuleAjaxCalls).done(function() {
    SourceCreator.prototype.finalizeSource(classJSON, callbackfunction, showChapters, showSections)
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
SourceCreator.prototype.finalizeSource = function(classJSON, callbackfunction, showChapters, showSections) {
  var source = ""

  for (var i = 0; i < classJSON.classmodules.length; i++) {
    fileSource = classJSON.ajaxCall[i].responseText

    fileSource = SourceCreator.prototype.processIncludeAndExclude(fileSource, classJSON.classmodules[i], classJSON)

    moduleSource = ""

    if (showChapters == true) {
      moduleSource += SourceCreator.prototype.addChapters(fileSource)
    }

    moduleSource += SourceCreator.prototype.importModule(fileSource, classJSON.classmodules[i].filename, classJSON)

    if (showSections == true) {
      moduleSource = SourceCreator.prototype.addSections(moduleSource, classJSON.classmodules[i].filename, classJSON)
    }

    // Files shouldn't have --- at the head or foot
    // It is added automatically here
    if (i + 1 < classJSON.classmodules.length) {
      moduleSource += "\n---\n"
    }

    source += moduleSource
  }

  //console.log(source)

  // All modules downloaded, callback to function that we're done
  callbackfunction(source)
}

// If there is an include or exclude, process them
SourceCreator.prototype.processIncludeAndExclude = function(fileSource, moduleInfo, classJSON) {
  includeSlides = moduleInfo["include"];
  excludeSlides = moduleInfo["exclude"];

  // Include and excludes are optional. Check if they're there.
  if (includeSlides == undefined && excludeSlides == undefined) {
    // Neither defined. Return as is
    return fileSource
  } else {
    // Split file into slides
    fileSplits = fileSource.split("---")

    // Convert splits to map
    fileSplits = fileSplits.reduce(function(o, v, i) {
      valuesMap = {}
      valuesMap["slidetext"] = v
      valuesMap["included"] = "unknown"

      o[i.toString()] = valuesMap;
      return o;
    }, {});

    slidesToInclude = []

    // See if it include exists
    if (includeSlides == undefined) {
      // Add all if it doesn't exist
      slidesToInclude = SourceCreator.prototype.range(1, fileSplits.length)
    } else {
      // Add specifically included slides
      slidesToInclude = SourceCreator.prototype.mixrange(includeSlides)
    }

    for (var i = slidesToInclude.length - 1; i >= 0; i--) {
      fileSplits[slidesToInclude[i].toString()]["included"] = "included"
    }

    // See if it exclude exists
    if (excludeSlides != undefined) {
      // Split and add all
      slidesToExclude = SourceCreator.prototype.mixrange(excludeSlides)

      for (var i = slidesToExclude.length - 1; i >= 0; i--) {
        fileSplits[slidesToExclude[i].toString()]["included"] = "excluded"
      }
    }

    // Reassemble the slides with the includes and excludes
    toReturn = ""
    var first = true

    for (var i in fileSplits) {
      if (fileSplits[i]["included"] == "included") {
        if (first == false) {
          toReturn += "---"
        }

        toReturn += fileSplits[i]["slidetext"]

        first = false
      }
    }

    return toReturn
  }
}

// Gets the ranges to include
SourceCreator.prototype.mixrange = function(s) {
  r = []

  var rangeSplit = s.split(" ")

  for (var i = 0; i < rangeSplit.length; i++) {
    if (rangeSplit[i].indexOf('-') == -1) {
      r.push(parseInt(rangeSplit[i]))
    } else {
      numberSplit = rangeSplit[i].split("-")

      start = parseInt(numberSplit[0])
      stop = parseInt(numberSplit[1])
      
      rangeArray = this.range(start, stop + 1)

      for (var j = 0; j < rangeArray.length; j++) {
        r.push(rangeArray[j])
      }
    }
  }

  return r;
}

// Gets an array based on the array
SourceCreator.prototype.range = function(start, stop, step){
  if (typeof stop=='undefined'){
      // one param defined
      stop = start;
      start = 0;
  };
  if (typeof step=='undefined'){
      step = 1;
  };
  if ((step>0 && start>=stop) || (step<0 && start<=stop)){
      return [];
  };
  var result = []
  for (var i=start; step>0 ? i<stop : i>stop; i+=step){
      result.push(i);
  };
  return result;
};

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

// Create sections
SourceCreator.prototype.addSections = function(fileSource, moduleFileName, classJSON) {
  // Add the section macro
  re = /template:\s+section\nname:\s+(.*)\n/g;

  var fileSource = fileSource.replace(re, function myFunction(match, group1) {
    source = match + "\ntemplate: chapterorsectionlist\n"
    source += "name: " + group1 + " Sections\n"
    source += "![:showsections " + SourceCreator.prototype.currentChapter + ", " + group1 + "]\n"
    // Don't need to add a --- because the source of the regex already has one
    //source += "---\n"

    return source;
  });

  return fileSource
}

SourceCreator.prototype.currentChapter = ""

SourceCreator.prototype.addChapters = function(fileSource) {
  // Add the chapters macro
  var m;
  var re = /template:\s+chapter\nname:\s+(.*)\n/;

  if ((m = re.exec(fileSource)) !== null) {
    source = "\ntemplate: chapterorsectionlist\n"
    source += "name: Course Chapters\n"
    source += "![:showchapters " + m[1] + "]\n"
    source += "---\n"

    SourceCreator.prototype.currentChapter = m[1]

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
      jqxhr.status + " Response:\n\"" + jqxhr.responseText + "\"")
  });
}
