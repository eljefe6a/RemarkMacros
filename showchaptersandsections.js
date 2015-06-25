/*
In the Markdown:

![:showchapterorsection chapter]
Will show all chapters and highlight the current chapter

![:showchapterorsection section]
Will show all sections for the current chapter and highlight the current section
*/

//ShowChapterOrSectionMacro.prototype.listOfChapters = []


var ShowChapterOrSectionMacro = function (source) {
  var includeSourceMacro = this

  remark.macros.showchapterorsection = function () {
    return includeSourceMacro.addChapterOrSection(arguments[0]);
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

// Adds a file by parsing the !INCLUDE
ShowChapterOrSectionMacro.prototype.addChapterOrSection = function(chapterOrSection) {
  if (chapterOrSection.toLowerCase() == "chapter") {
    return this.outputChapters()
  } else if (chapterOrSection.toLowerCase() == "section") {
    // Output section information
  } else {
    console.log("Chapter Or Section argument not recognized. Argument was \"" 
      + chapterOrSection + "\"")

    return "Invalid Argument"
  }
};

ShowChapterOrSectionMacro.prototype.outputChapters = function() {
  // Output chapter information
  chaptersList = "<ul>"

  for (var i = 0; i < this.listOfChapters.length; i++) {
    chaptersList += "<li>" + this.listOfChapters[i] + "</li>"
  }

  chaptersList += "</ul>"

  return chaptersList
};