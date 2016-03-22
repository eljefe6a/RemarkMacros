/*
In the Markdown:

![:showchapters chaptername]
Will show all chapters and highlight the chapter.
The selected chapter will use the selected-chapter CSS class.

![:showsections chaptername sectionname]
Will show all sections for the chapter and highlight the section.
The selected section will use the selected-section CSS class.
*/

//ShowChapterOrSectionMacro.prototype.listOfChapters = []

var ShowChapterOrSectionMacro = function (source) {
  var includeSourceMacro = this

  remark.macros.showchapters = function () {
    return includeSourceMacro.outputChapters(arguments[0]);
  };

  remark.macros.showsections = function () {
    return includeSourceMacro.outputSections(arguments[0],arguments[1]);
  };

  console.log("Added ShowChapterOrSection macros")
};

ShowChapterOrSectionMacro.prototype.chaptersToSectionsMap = {};
ShowChapterOrSectionMacro.prototype.listOfChapters = [];

ShowChapterOrSectionMacro.prototype.parseSource = function(source) {
  
  allLines = source.split("\n")

  currentChapterName = ""

  var chapterre = /template:\s?chapter\s?$/;
  var sectionre = /template:\s?section\s?$/;
  var namere = /name:\s?(.*)\s?$/;
  var m;

  for (var i = 0; i < allLines.length; i++) {
    if ((m = chapterre.exec(allLines[i])) !== null) {
      // Verify next row is the name
      if ((m = namere.exec(allLines[i+1])) !== null) {
        ShowChapterOrSectionMacro.prototype.listOfChapters.push(m[1])
      } else {
        console.log("Couldn't find chapter name for line " + i)
      }
    } else if ((m = sectionre.exec(allLines[i])) !== null) {
      // Verify next row is the name
      if ((m = namere.exec(allLines[i+1])) !== null) {
        chapterSectionsArray = ShowChapterOrSectionMacro.prototype.chaptersToSectionsMap[currentChapterName]

        if (chapterSectionsArray == undefined) {
          chapterSectionsArray = []
          ShowChapterOrSectionMacro.prototype.chaptersToSectionsMap[currentChapterName] = chapterSectionsArray
        }

        chapterSectionsArray.push(m[1])
      } else {
        console.log("Couldn't find section name for line " + i)
      }
    }
  }
}

// Adds the text for the chapter macro
ShowChapterOrSectionMacro.prototype.outputChapters = function(chapterName) {
  // Output chapter information
  chaptersList = "<ul class=\"chapter-list\">"

  for (var i = 0; i < ShowChapterOrSectionMacro.prototype.listOfChapters.length; i++) {
    chaptersList += "<li"

    if (ShowChapterOrSectionMacro.prototype.listOfChapters[i] == chapterName) {
      chaptersList += " class=\"selected-chapter\""
    }

    chaptersList += ">" + ShowChapterOrSectionMacro.prototype.listOfChapters[i] + "</li>"
  }

  chaptersList += "</ul>"

  return chaptersList
};

// Adds the text for the section macro
ShowChapterOrSectionMacro.prototype.outputSections = function(chapterName, sectionName) {
  // Output chapter information
  chapterSectionsArray = ShowChapterOrSectionMacro.prototype.chaptersToSectionsMap.get(chapterName)

  sectionsList = "<ul class=\"section-list\">"

  for (var i = 0; i < chapterSectionsArray.length; i++) {
    sectionsList += "<li"

    if (chapterSectionsArray[i] == sectionName) {
      sectionsList += " class=\"selected-section\""
    }

    sectionsList += ">" + chapterSectionsArray[i] + "</li>"
  }

  sectionsList += "</ul>"

  return sectionsList
};
