
var SlideDecorators = function () {
  console.log("Started SlideDecorators")
};

SlideDecorators.prototype.decorateChapterList = function(currentSlideSource, sourceObj, chapter, globalDecorators, params) {
  if (params.showChapters == true && chapter.header.template != "title") {
    // Output chapter list
    source = "\ntemplate: chapterlist\n"
    source += "name: Course Chapters\n"

    // Output chapter information
    source += "<ul class=\"chapter-list\">"

    for (var i = 0; i < sourceObj.chapters.length; i++) {
      if (sourceObj.chapters[i].header.template == "title") {
        // Skip titles in chapter list
        continue;
      }

      source += "<li"

      if (sourceObj.chapters.indexOf(chapter) == i) {
        source += " class=\"selected-chapter\""
      }

      source += ">" + sourceObj.chapters[i].header.name + "</li>"
    }

    source += "</ul>\n"

    // Run the global decorators on the newly added slide
    for (var i = 0; i < globalDecorators.length; i++) {
      source = globalDecorators[i](source, sourceObj, chapter, params)
    }

    return source + "---\n" + currentSlideSource
  } else {
    return currentSlideSource
  }
}

SlideDecorators.prototype.decorateChapterNumber = function(currentSlideSource, sourceObj, chapter, globalDecorators, params) {
  // Prepend chapter number
  // Chapter index is zero based
  source = "chapternumber: " + (sourceObj.chapters.indexOf(chapter) + 1 + params["chapternumberoffset"]) + "\n" + currentSlideSource
  return source
}

SlideDecorators.prototype.decorateSection = function(currentSlideSource, sourceObj, chapter, section, globalDecorators, params) {
  if (params.showSections == true) {
    // Output chapter list
    source = "\ntemplate: sectionlist\n"
    source += "chaptername: " + chapter.header.name + "\n"
    source += "name: " + section.header.name + "\n"

    // Output chapter information
    source += "<ul class=\"section-list\">"

    for (var i = 0; i < chapter.sections.length; i++) {
      source += "<li"

      if (chapter.sections.indexOf(section) == i) {
        source += " class=\"selected-section\""
      }

      source += ">" + chapter.sections[i].header.name + "</li>"
    }

    source += "</ul>\n"

    // Run the global decorators on the newly added slide
    for (var i = 0; i < globalDecorators.length; i++) {
      source = globalDecorators[i](source, sourceObj, section, params)
    }

    return source + "---\n" + currentSlideSource
  } else {
    return currentSlideSource
  }
}

SlideDecorators.prototype.decorateSlide = function(currentSlideSource, sourceObj, chapter, section, slide, params) {

}

SlideDecorators.prototype.globalVersionDecorator = function(currentSlideSource, sourceObj, slide, params) {
  // Prepend version number
  source = "version: " + params["version"].shortcommitid + "\n" + currentSlideSource
  return source
}