// Processes and includes all files in the class.json
// 
// Also processes the ![:includemodule] macro
// Can be used with ![:includemodule path/to/module.md]

var SourceCreator = function () {
};

SourceCreator.prototype.classJSONUrl = "";
SourceCreator.prototype.classJSON = null;
SourceCreator.prototype.callbackfunction = null;
SourceCreator.prototype.params = {};

// Downloads the sourceUrls and returns the results in Remark format
SourceCreator.prototype.createSource = function() {
  console.log("SourceCreator init")
}

// Downloads the sourceUrls and calls the second step
SourceCreator.prototype.createSource = function(classJSONUrl, callbackfunction, params) {
  SourceCreator.prototype.classJSONUrl = classJSONUrl;
  SourceCreator.prototype.callbackfunction = callbackfunction;
  SourceCreator.prototype.params = params;

  // Download class file
  DownloadManager.prototype.getFile(classJSONUrl, function(classfile) {
    DownloadManager.prototype.classJSON = JSON.parse(classfile)

    // Set the class title
    document.title = DownloadManager.prototype.classJSON.classname

    var downloadManager = new DownloadManager();

    // Download all modules
    for (var i = 0; i < DownloadManager.prototype.classJSON.classmodules.length; i++) {
      downloadManager.addURL(DownloadManager.prototype.classJSON.classmodules[i].filename)
    }

    downloadManager.downloadAll(SourceCreator.prototype.createSourceObj)

    // Add all modules for the class
    //$.when.apply($, DownloadManager.prototype.classJSON.ajaxCall).done(function() {
    //  SourceCreator.prototype.downloadAllModules(DownloadManager.prototype.classJSON, callbackfunction, params)
    //})
  })
}

SourceCreator.prototype.createSourceObj = function(urlToAjax) {
  // Download all modules
  sourceObj = {"headers": [], "chapters": []}

  var currentChapter = null;
  var currentSection = null;

  for (var i = 0; i < DownloadManager.prototype.classJSON.classmodules.length; i++) {
    slides = urlToAjax[DownloadManager.prototype.classJSON.classmodules[i].filename].responseText.split("\n---\n")

    for (var j = 0; j < slides.length; j++) {
      slide = SourceCreator.prototype.parseSlide(slides[j])

      template = slide["header"]["template"]
      layout = slide["header"]["layout"]

      if (layout == "true") {
        // A layout/header slide
        sourceObj.headers.push(slide)
      } else if (template == "title" || template == "titlewithsubtitle" || template == "chapter") {
        currentChapter = slide

        // Put slide at root
        sourceObj.chapters.push(slide)
        slide["sections"] = []

        // Null out currentSection so it has to be set or created automatically
        currentSection = null;
      } else if (template == "section") {
        currentSection = slide
        currentChapter.sections.push(currentSection)
        slide["slides"] = []
      } else {
        if (currentSection == null) {
          // Some chapters and titles don't have sections. Create one.
          currentSection = {
            header: {"template": "section", "name": "section"},
            privateheader: {"hidden": true},
            contents: [],
            notes: "",
            slides: []
          }

          currentChapter.sections.push(currentSection)
        }

        // All other slide types
        currentSection.slides.push(slide)
      }
    }
  }

  console.dir(sourceObj)
}

SourceCreator.prototype.parseSlide = function(slideText) {
  slide = {
    header: {},
    privateheader: {},
    contents: [],
    notes: ""
  }

  isHeader = true

  // Separate slide from notes
  slideAndNotes = slideText.split("\n???\n")

  // Verify there were actual notes
  if (slideAndNotes.length == 2) {
    slide.notes = slideAndNotes[1]
  }

  // Go through the rest line by line
  slideLines = slideAndNotes[0].split("\n")

  var m;
  var re = /([a-z]*):\s?(.*)/;

  for (var i = 0; i < slideLines.length; i++) {
    // Skip any empty lines before the headers are found
    if (slideLines[i].length == 0 && isHeader == true) {
      continue;
    }

    if (isHeader == true && (m = re.exec(slideLines[i])) !== null) {
      // Go through al key/value pairs in the header
      slide.header[m[1]] = m[2]
    } else {
      // Now slide contents
      isHeader = false

      slide.contents.push(slideLines[i])
    }
  }

  return slide
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
    fileSplits = fileSource.split("\n---\n")

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
      slidesToInclude = SourceCreator.prototype.range(1, Object.keys(fileSplits).length)
    } else {
      // Add specifically included slides
      slidesToInclude = SourceCreator.prototype.mixrange(includeSlides)
    }

    for (var i = 0; i < slidesToInclude.length; i++) {
      // Array is 0 based but splits start at 1
      fileSplits[(slidesToInclude[i] - 1).toString()]["included"] = "included"
    }

    // See if it exclude exists
    if (excludeSlides != undefined) {
      // Split and add all
      slidesToExclude = SourceCreator.prototype.mixrange(excludeSlides)

      for (var i = 0; i < slidesToExclude.length; i++) {
        // Array is 0 based but splits start at 1
        fileSplits[(slidesToExclude[i] - 1).toString()]["included"] = "excluded"
      }
    }

    // Reassemble the slides with the includes and excludes
    toReturn = ""
    var first = true

    for (var i in fileSplits) {
      if (fileSplits[i]["included"] == "included") {
        if (first == false) {
          toReturn += "\n---\n"
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
    source = match + "\ntemplate: sectionlist\n"
    source += "chaptername: " + SourceCreator.prototype.currentChapter + "\n"
    source += "name: " + group1 + "\n"
    source += "![:showsections " + SourceCreator.prototype.currentChapter + ", " + group1 + "]\n"
    // Don't need to add a --- because the source of the regex already has one
    //source += "---\n"

    return source;
  });

  return fileSource
}

SourceCreator.prototype.currentChapter = ""
SourceCreator.prototype.currentChapterNumber = 1

SourceCreator.prototype.addChapters = function(fileSource) {
  // Add the chapters macro
  var m;
  var re = /template:\s+chapter\nname:\s+(.*)\n/;

  if ((m = re.exec(fileSource)) !== null) {
    source = "\ntemplate: chapterlist\n"
    source += "name: Course Chapters\n"
    source += "![:showchapters " + m[1] + "]\n"
    source += "---\n"
    source += "chapternumber: " + SourceCreator.prototype.currentChapterNumber + "\n"

    SourceCreator.prototype.currentChapter = m[1]
    SourceCreator.prototype.currentChapterNumber += 1

    return source;
  }

  return ""
}
