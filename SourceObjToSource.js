
var SourceObjToSource = function () {
  console.log("Started SourceObjToSource")
};

// The final step in the callback hell. Adds modules.
SourceObjToSource.prototype.finalizeSource = function(sourceObj, params, globalDecorators, chapterDecorators, sectionDecorators, slideDecorators) {
  var source = ""

  for (var headerindex = 0; headerindex < sourceObj.headers.length; headerindex++) {
    if (sourceObj.headers[headerindex].privateheader.included == false) {
      continue;
    }

    source += SourceObjToSource.prototype.processHeader(sourceObj.headers[headerindex])
  }

  for (var chapterindex = 0; chapterindex < sourceObj.chapters.length; chapterindex++) {
    if (sourceObj.chapters[chapterindex].privateheader.included == true) {
      // Include the chapter's slide
      source += SourceObjToSource.prototype.processChapter(sourceObj, sourceObj.chapters[chapterindex], params, globalDecorators, chapterDecorators)
    }

    for (var sectionindex = 0; sectionindex < sourceObj.chapters[chapterindex].sections.length; sectionindex++) {
      if (sourceObj.chapters[chapterindex].sections[sectionindex].privateheader.included == true) {
        // Include the section's slide
        source += SourceObjToSource.prototype.processSection(sourceObj, sourceObj.chapters[chapterindex], sourceObj.chapters[chapterindex].sections[sectionindex], params, globalDecorators, sectionDecorators);
      }

      for (var slideindex = 0; slideindex < sourceObj.chapters[chapterindex].sections[sectionindex].slides.length; slideindex++) {
        // Verify it is included
        if (sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex].privateheader.included == true) {
          source += SourceObjToSource.prototype.processSlide(sourceObj, sourceObj.chapters[chapterindex], sourceObj.chapters[chapterindex].sections[sectionindex], sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex], params, globalDecorators, slideDecorators)
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

SourceObjToSource.prototype.processHeader = function(header, params) {
  return SourceObjToSource.prototype.simpleSlide(header, params)
}

SourceObjToSource.prototype.processChapter = function(sourceObj, chapter, params, globalDecorators, chapterDecorators) {
  if (chapter.privateheader.hidden == true) {
    // Never output hidden chapters
    return ""
  }

  slideSource = SourceObjToSource.prototype.simpleSlide(chapter, params)

  for (var i = 0; i < globalDecorators.length; i++) {
    slideSource = globalDecorators[i](slideSource, sourceObj, chapter, params)
  }

  for (var i = 0; i < chapterDecorators.length; i++) {
    slideSource = chapterDecorators[i](slideSource, sourceObj, chapter, globalDecorators, params)
  }

  return slideSource
}

SourceObjToSource.prototype.processSection = function(sourceObj, chapter, section, params, globalDecorators, sectionDecorators) {
  if (section.privateheader.hidden == true) {
    // Never output hidden sections
    return ""
  }

  slideSource = SourceObjToSource.prototype.simpleSlide(section, params)

  for (var i = 0; i < globalDecorators.length; i++) {
    slideSource = globalDecorators[i](slideSource, sourceObj, section, params)
  }

  for (var i = 0; i < sectionDecorators.length; i++) {
    slideSource = sectionDecorators[i](slideSource, sourceObj, chapter, section, globalDecorators, params)
  }

  return slideSource
}

SourceObjToSource.prototype.processSlide = function(sourceObj, chapter, section, slide, params, globalDecorators, slideDecorators) {
  if (slide.privateheader.hidden == true) {
    // Never output hidden slides
    return ""
  }

  slideSource = SourceObjToSource.prototype.simpleSlide(slide, params)

  for (var i = 0; i < globalDecorators.length; i++) {
    slideSource = globalDecorators[i](slideSource, sourceObj, slide, params)
  }

  for (var i = 0; i < slideDecorators.length; i++) {
    slideSource = slideDecorators[i](slideSource, sourceObj, chapter, section, slide, globalDecorators, params)
  }

  return slideSource
}

SourceObjToSource.prototype.simpleSlide = function(slide, params) {
  slideText = ""

  for(var key in slide.header) {
    slideText += key + ": " + slide.header[key];
    slideText += "\n"
  }

  for (var contextindex = 0; contextindex < slide.contents.length; contextindex++) {
    slideText += slide.contents[contextindex];
    slideText += "\n"
  }

  slideText += "\n---\n"
  return slideText
}