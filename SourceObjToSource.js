
var SourceObjToSource = function () {
  console.log("Started SourceObjToSource")
};

// The final step in the callback hell. Adds modules.
SourceObjToSource.prototype.finalizeSource = function(sourceObj, params, initialCreator, headerDecorators, globalDecorators, chapterDecorators, sectionDecorators, slideDecorators) {
  var source = ""

  for (var headerindex = 0; headerindex < sourceObj.headers.length; headerindex++) {
    if (sourceObj.headers[headerindex].privateheader.included == false) {
      continue;
    }

    for (var i = 0; i < headerDecorators.length; i++) {
      source = headerDecorators[i](sourceObj.headers[headerindex])
    }
  }

  for (var chapterindex = 0; chapterindex < sourceObj.chapters.length; chapterindex++) {
    if (sourceObj.chapters[chapterindex].privateheader.included == true) {
      // Include the chapter's slide
      source += SourceObjToSource.prototype.processChapter(sourceObj, sourceObj.chapters[chapterindex], params, initialCreator, globalDecorators, chapterDecorators)
    }

    for (var sectionindex = 0; sectionindex < sourceObj.chapters[chapterindex].sections.length; sectionindex++) {
      if (sourceObj.chapters[chapterindex].sections[sectionindex].privateheader.included == true) {
        // Include the section's slide
        source += SourceObjToSource.prototype.processSection(sourceObj, sourceObj.chapters[chapterindex], sourceObj.chapters[chapterindex].sections[sectionindex], params, initialCreator, globalDecorators, sectionDecorators);
      }

      for (var slideindex = 0; slideindex < sourceObj.chapters[chapterindex].sections[sectionindex].slides.length; slideindex++) {
        // Verify it is included
        if (sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex].privateheader.included == true) {
          source += SourceObjToSource.prototype.processSlide(sourceObj, sourceObj.chapters[chapterindex], sourceObj.chapters[chapterindex].sections[sectionindex], sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex], params, initialCreator, globalDecorators, slideDecorators)
        }
      }
    }
  }
  
  // There is a trailing "\n---\n" that needs to be removed
  // Truncate it.
  source = source.substring(0, source.length - 4)
  //console.log(source)
  return source
}

SourceObjToSource.prototype.processChapter = function(sourceObj, chapter, params, initialCreator, globalDecorators, chapterDecorators) {
  if (chapter.privateheader.hidden == true) {
    // Never output hidden chapters
    return ""
  }

  slideSource = initialCreator(chapter, params)

  for (var i = 0; i < globalDecorators.length; i++) {
    slideSource = globalDecorators[i](slideSource, sourceObj, chapter, params)
  }

  for (var i = 0; i < chapterDecorators.length; i++) {
    slideSource = chapterDecorators[i](slideSource, sourceObj, chapter, globalDecorators, params)
  }

  return slideSource
}

SourceObjToSource.prototype.processSection = function(sourceObj, chapter, section, params, initialCreator, globalDecorators, sectionDecorators) {
  if (section.privateheader.hidden == true) {
    // Never output hidden sections
    return ""
  }

  slideSource = initialCreator(section, params)

  for (var i = 0; i < globalDecorators.length; i++) {
    slideSource = globalDecorators[i](slideSource, sourceObj, section, params)
  }

  for (var i = 0; i < sectionDecorators.length; i++) {
    slideSource = sectionDecorators[i](slideSource, sourceObj, chapter, section, globalDecorators, params)
  }

  return slideSource
}

SourceObjToSource.prototype.processSlide = function(sourceObj, chapter, section, slide, params, initialCreator, globalDecorators, slideDecorators) {
  if (slide.privateheader.hidden == true) {
    // Never output hidden slides
    return ""
  }

  slideSource = initialCreator(slide, params)

  for (var i = 0; i < globalDecorators.length; i++) {
    slideSource = globalDecorators[i](slideSource, sourceObj, slide, params)
  }

  for (var i = 0; i < slideDecorators.length; i++) {
    slideSource = slideDecorators[i](slideSource, sourceObj, chapter, section, slide, globalDecorators, params)
  }

  return slideSource
}