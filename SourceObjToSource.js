
var SourceObjToSource = function () {
  console.log("Started SourceObjToSource")
};

// The final step in the callback hell. Adds modules.
SourceObjToSource.prototype.finalizeSource = function(sourceObj, params) {
  var source = ""

  for (var headerindex = 0; headerindex < sourceObj.headers.length; headerindex++) {
    if (sourceObj.headers[headerindex].privateheader.included == false) {
      continue;
    }

    source += SourceObjToSource.prototype.processHeader(sourceObj.headers[headerindex])
  }

  for (var chapterindex = 0; chapterindex < sourceObj.chapters.length; chapterindex++) {
    if (sourceObj.chapters[chapterindex].privateheader.included == false) {
      continue;
    }

    source += SourceObjToSource.prototype.processChapter(sourceObj.chapters[chapterindex])

    for (var sectionindex = 0; sectionindex < sourceObj.chapters[chapterindex].sections.length; sectionindex++) {
      if (sourceObj.chapters[chapterindex].sections[sectionindex].privateheader.included == false) {
        continue;
      }

      source += SourceObjToSource.prototype.processChapter(sourceObj.chapters[chapterindex].sections[sectionindex])

      for (var slideindex = 0; slideindex < sourceObj.chapters[chapterindex].sections[sectionindex].slides.length; slideindex++) {
        // Verify it is included
        if (sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex].privateheader.included == true) {
          source += SourceObjToSource.prototype.processSlide(sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex])
        }
      }
    }
  }
  
  //console.log(source)
  return source
}

SourceObjToSource.prototype.processHeader = function(header, params) {
  return SourceObjToSource.prototype.simpleSlide(header, params)
}

SourceObjToSource.prototype.processChapter = function(chapter, params) {
  return SourceObjToSource.prototype.simpleSlide(chapter, params)
}

SourceObjToSource.prototype.processSection = function(section, params) {
  return SourceObjToSource.prototype.simpleSlide(section, params)
}

SourceObjToSource.prototype.processSlide = function(slide, params) {
  return SourceObjToSource.prototype.simpleSlide(slide, params)
}

SourceObjToSource.prototype.simpleSlide = function(slide, params) {
  if (slide.privateheader.hidden == true) {
    return ""
  }

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