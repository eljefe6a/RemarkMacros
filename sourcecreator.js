// Processes and includes all files in the class.json
// 
// Also processes the ![:includemodule] macro
// Can be used with ![:includemodule path/to/module.md]

var SourceCreator = function () {
  console.log("Started SourceCreator")
};

SourceCreator.prototype.classJSON = null;
SourceCreator.prototype.callbackfunction = null;
SourceCreator.prototype.params = {};

// Downloads the sourceUrls and calls the second step
SourceCreator.prototype.createSource = function(params, callbackfunction) {
  SourceCreator.prototype.callbackfunction = callbackfunction;
  SourceCreator.prototype.params = params;

  // Download class file
  DownloadManager.prototype.getFile(SourceCreator.prototype.params["url"], function(classfile) {
    SourceCreator.prototype.classJSON = JSON.parse(classfile)

    // Set the class title
    document.title = SourceCreator.prototype.classJSON.classname

    var downloadManager = new DownloadManager();

    // Download all modules
    for (var i = 0; i < SourceCreator.prototype.classJSON.classmodules.length; i++) {
      downloadManager.addURL(SourceCreator.prototype.classJSON.classmodules[i].filename)
      console.log("Downloading class module:" + SourceCreator.prototype.classJSON.classmodules[i].filename)
    }

    downloadManager.downloadAll(SourceCreator.prototype.createSourceObj)
  })
}

SourceCreator.prototype.createSourceObj = function(urlToAjax) {
  // Download all modules
  sourceObj = {"headers": [], "chapters": []}

  var currentChapter = null;
  var currentSection = null;

  for (var i = 0; i < SourceCreator.prototype.classJSON.classmodules.length; i++) {
    slides = urlToAjax[SourceCreator.prototype.classJSON.classmodules[i].filename].responseText.split("\n---\n")

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

    // NOTE: This assumes a module doesn't have more than one chapter
    SourceCreator.prototype.processIncludeAndExclude(currentChapter, SourceCreator.prototype.classJSON.classmodules[i])  
  }  

  console.dir(sourceObj)
  SourceCreator.prototype.callbackfunction(sourceObj)
}

SourceCreator.prototype.parseSlide = function(slideText) {
  slide = {
    header: {},
    privateheader: {"included": true},
    contents: [],
    notes: ""
  }

  // Separate slide from notes
  slideAndNotes = slideText.split("\n???\n")

  // Verify there were actual notes
  if (slideAndNotes.length == 2) {
    slide.notes = slideAndNotes[1]
  }

  // Go through the rest line by line
  slideLines = slideAndNotes[0].split("\n")

  var m;
  var re = /^([a-z]+):\s?(.+)$/;

  for (var i = 0; i < slideLines.length; i++) {
    if ((m = re.exec(slideLines[i])) !== null) {
      // Go through al key/value pairs in the header
      slide.header[m[1]] = m[2]
    } else {
      // Now slide contents
      slide.contents.push(slideLines[i])
    }
  }

  return slide
}

// If there is an include or exclude, process them
SourceCreator.prototype.processIncludeAndExclude = function(chapter, moduleInfo) {
  includeSlides = moduleInfo["include"];
  excludeSlides = moduleInfo["exclude"];

  // Include and excludes are optional. Check if they're there.
  if (includeSlides == undefined && excludeSlides == undefined) {
    // Neither defined. Return as is
    return
  } else {
    slidesToInclude = []
    slidesToExclude = []

    // See if it include exists
    if (includeSlides != undefined) {
      // Add specifically included slides
      slidesToInclude = SourceCreator.prototype.mixrange(includeSlides)

      currentSlideNumber = 0

      for (var i = 0; chapter.sections.length; i++) {
        currentSlideNumber++
        
        // Array is 0 based but splits start at 1
        if (!slidesToInclude.includes[currentSlideNumber + 1]) {
          // Everything is included by default
          chapter.sections[i].privateheader.included = false
        }

        // Now go through slides
        for(var j = 0; chapter.sections[i].length; j++) {
          currentSlideNumber++
        
          // Array is 0 based but splits start at 1
          if (!slidesToInclude.includes[currentSlideNumber + 1]) {
            // Everything is included by default
            chapter.sections[i].slides[j].privateheader.included = false
          }
        }
      }
    }

    // See if it exclude exists
    if (excludeSlides != undefined) {
      // Split and add all
      slidesToExclude = SourceCreator.prototype.mixrange(excludeSlides)

      for (var i = 0; chapter.sections.length; i++) {
        currentSlideNumber++
        
        // Array is 0 based but splits start at 1
        if (slidesToExclude.includes[currentSlideNumber + 1]) {
          // Everything is included by default
          chapter.sections[i].privateheader.included = false
        }

        // Now go through slides
        for(var j = 0; chapter.sections[i].length; j++) {
          currentSlideNumber++
        
          // Array is 0 based but splits start at 1
          if (slidesToExclude.includes[currentSlideNumber + 1]) {
            // Everything is included by default
            chapter.sections[i].slides[j].privateheader.included = false
          }
        }
      }
    }
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
