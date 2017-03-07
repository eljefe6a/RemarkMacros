var ImportModule = function () {
  console.log("Started ImportModule")
};

ImportModule.prototype.sourceObj = null;
ImportModule.prototype.callbackfunction = null;

ImportModule.prototype.importModules = function(sourceObj, callbackfunction) {
  ImportModule.prototype.sourceObj = sourceObj
  ImportModule.prototype.callbackfunction = callbackfunction

  downloadManager = new DownloadManager();

  ImportModule.prototype.findModules(function(fileURL, chapter, section, slide, chapterindex, sectionindex, slideindex) {
    downloadManager.addURL(fileURL)
    console.log("Downloading section module:" + fileURL)
  });

  downloadManager.downloadAll(ImportModule.prototype.addModules)
}

ImportModule.prototype.addModules = function(urlToAjax) {
  ImportModule.prototype.findModules(function(fileURL, chapter, section, slide, chapterindex, sectionindex, slideindex) {
    moduleSections = ImportModule.prototype.addSlides(urlToAjax[fileURL].responseText)
    // Delete the module include slide
    delete section[slideindex]
    // Splice in the new slides
    chapter.sections = ImportModule.prototype.arraySplice(chapter.sections, moduleSections, sectionindex + 1)
  });

  ImportModule.prototype.callbackfunction(ImportModule.prototype.sourceObj)
}

ImportModule.prototype.arraySplice = function(array1, array2, index) {
  for (var i = array2.length - 1; i >= 0; i--) {
    array1.splice(index, 0, array2[i])
  }

  return array1
}

ImportModule.prototype.addSlides = function(moduleText) {
  slides = moduleText.split("\n---\n")

  currentSection = null
  sections = []

  for (var j = 0; j < slides.length; j++) {
    slide = SourceCreator.prototype.parseSlide(slides[j])

    template = slide["header"]["template"]

    // NOTE: Modules should only be sections and regular slides
    if (template == "section") {
      currentSection = slide
      slide["slides"] = []
      sections.push(currentSection)
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

        sections.push(currentSection)
      }

      // All other slide types
      currentSection.slides.push(slide)
    }
  }

  return sections
}

ImportModule.prototype.findModules = function(callback) {
  // Import any includemodule
  var m;
  var re = /!\[:includemodule (.*)\]/;

  for (var i = 0; i < ImportModule.prototype.sourceObj.chapters.length; i++) {
    for (var j = 0; j < ImportModule.prototype.sourceObj.chapters[i].sections.length; j++) {
      for (var k = 0; k < ImportModule.prototype.sourceObj.chapters[i].sections[j].slides.length; k++) {
        // Go through slide contents
        for (var slideindex = 0; slideindex < ImportModule.prototype.sourceObj.chapters[i].sections[j].slides[k].contents.length; slideindex++) {
          if ((m = re.exec(ImportModule.prototype.sourceObj.chapters[i].sections[j].slides[k].contents[slideindex])) !== null) {
            // Callback now that we've found a module
            callback(m[1], ImportModule.prototype.sourceObj.chapters[i], ImportModule.prototype.sourceObj.chapters[i].sections[j], ImportModule.prototype.sourceObj.chapters[i].sections[j].slides[k], i, j, k)
          }
        }
      }
    }
  }
}
