
var SlideDecorators = function () {
  console.log("Started SlideDecorators")
};

SlideDecorators.prototype.decorateChapterList = function(currentSlideSource, sourceObj, chapter, params) {
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

    source += "</ul>\n---\n"

    return source + currentSlideSource
  } else {
    return currentSlideSource
  }
}

SlideDecorators.prototype.decorateChapterNumber = function(currentSlideSource, sourceObj, chapter, params) {
  // Prepend chapter number
  // Chapter index is zero based
  source = "chapternumber: " + (sourceObj.chapters.indexOf(chapter) + 1) + "\n" + currentSlideSource
  console.log(source)
  return source
}

SlideDecorators.prototype.decorateSection = function(currentSlideSource, sourceObj, chapter, section, params) {
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

    source += "</ul>\n---\n"

    console.log(source + currentSlideSource)

    return source + currentSlideSource
  } else {
    return currentSlideSource
  }
}

SlideDecorators.prototype.decorateSlide = function(currentSlideSource, sourceObj, chapter, section, slide, params) {

}