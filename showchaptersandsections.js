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

  this.chaptersToSectionsMap = new Map()
  this.listOfChapters = new Array()
};

ShowChapterOrSectionMacro.prototype.parseSource = function(source) {
  
  allLines = source.split("\n")

  currentChapterName = ""

  for (var i = 0; i < allLines.length; i++) {
    // TODO: Replace with regex to ignore whitespace
    if (allLines[i] == "template: chapter") {
      // Verify next row is the name
      if (allLines[i+1].startsWith("name:")) {
        currentChapterName = allLines[i+1].split(":")[1].trim()

        this.listOfChapters.push(currentChapterName)
      } else {
        console.log("Couldn't find chapter name for line " + i)
      }
    } else if (allLines[i] == "template: section") {
      // Verify next row is the name
      if (allLines[i+1].startsWith("name:")) {
        chapterSectionsArray = this.chaptersToSectionsMap.get(currentChapterName)

        if (chapterSectionsArray == undefined) {
          chapterSectionsArray = []
          this.chaptersToSectionsMap.set(currentChapterName, chapterSectionsArray)
        }

        chapterSectionsArray.push(allLines[i+1].split(":")[1].trim())
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

  for (var i = 0; i < this.listOfChapters.length; i++) {
    chaptersList += "<li"

    if (this.listOfChapters[i] == chapterName) {
      chaptersList += " class=\"selected-chapter\""
    }

    chaptersList += ">" + this.listOfChapters[i] + "</li>"
  }

  chaptersList += "</ul>"

  return chaptersList
};

// Adds the text for the section macro
ShowChapterOrSectionMacro.prototype.outputSections = function(chapterName, sectionName) {
  // Output chapter information
  chapterSectionsArray = this.chaptersToSectionsMap.get(chapterName)

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