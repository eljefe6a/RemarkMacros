/*
In the Markdown:

![:includesource Class.java]
Will include Class.java with source code and add the code block with the file extension "java"

![:includesource Class.java, 2-4, 3, *]
Will include lines 2 to 4 from Class.java and highlight line 3 with an *

![:includesource Class.java, 2-4, 3 4, * trim]
Will include lines 2 to 4 from Class.java and highlight lines 3 and 4 with an * then trim the whitespace to the minimum needed for lines 2 to 4.
*/
var IncludeSourceMacro = function () {
  var includeSourceMacro = this

  remark.macros.includesource = function () {
    return includeSourceMacro.addFile(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);
  };

  console.log("Added include macros")
};

// Adds a file by parsing the !INCLUDE
IncludeSourceMacro.prototype.addFile = function(filename,includeLineNumbers,highlightLineNumbers,highlightCharacter,shouldTrimWhitespace) {
  includeLineNumbersArray = []
  highlightLineNumbersArray = []

  if (includeLineNumbers != undefined) {
    includeLineNumbersArray = this.mixrange(includeLineNumbers)
  }

  if (highlightLineNumbers != undefined) {
    highlightLineNumbersArray = this.mixrange(highlightLineNumbers)
  }

  if (highlightCharacter === undefined) {
    highlightCharacter = "*"
  }

  if (shouldTrimWhitespace === undefined) {
    shouldTrimWhitespace = false
  } else if (shouldTrimWhitespace == "trim") {
    shouldTrimWhitespace = true
  } else {
    shouldTrimWhitespace = false
  }

  console.log("Including source: " + filename + " lines:" + includeLineNumbers + " highlight:" + highlightLineNumbers + " character:" + highlightCharacter + " trim:" + shouldTrimWhitespace)

  return this.processIncludeLine(filename, includeLineNumbersArray, highlightLineNumbersArray, highlightCharacter, shouldTrimWhitespace)
}

// Does some initial checking on the file and either adds an error
// or the source code
IncludeSourceMacro.prototype.processIncludeLine = function(filename, includeLineNumbersArray, highlightLineNumbersArray, highlightCharacter, shouldTrimWhitespace) {
  // Check if the file was downloaded correctly
  if (IncludeSourceMacro.prototype.allIncludeAjaxCalls[filename].statusText != "OK") {
    // It wasn't downloaded correctly. Change the text to
    // JQuery's string of the error
    return "```\n" + IncludeSourceMacro.prototype.allIncludeAjaxCalls[filename].statusText + "\n```"
  } else {
    // It was downloaded correctly, add the source code
    return this.handleIncludeLine(filename, includeLineNumbersArray, highlightLineNumbersArray, highlightCharacter, shouldTrimWhitespace)
  }
}

// Adds the lines, and highlights the lines
IncludeSourceMacro.prototype.handleIncludeLine = function(filename, includeLineNumbersArray, highlightLineNumbersArray, highlightCharacter, shouldTrimWhitespace) {
  currentLineNumber = 1

  fileExtension = this.getFileExtension(filename)
  output = "```" + fileExtension + "\n"

  // File already downloaded, get it out of memory
  var fileSource = IncludeSourceMacro.prototype.allIncludeAjaxCalls[filename].responseText;

  var fileSplit = fileSource.split("\n")

  if (shouldTrimWhitespace == true) {
    whiteSpaceToTrim = this.calculateMinWhitespace(fileSplit, includeLineNumbersArray)
  }

  // Go through every line in file
  for (var i = 0; i < fileSplit.length; i++) {
    writeLine = true
    writeHighlight = false

    // Included line numbers provided
    if (includeLineNumbersArray.length != 0) {
      // Check if the line number is in the list provided
      if (includeLineNumbersArray.indexOf(currentLineNumber) == -1) {
        writeLine = false
      }
    }

    // Included highlight line numbers provided
    if (highlightLineNumbersArray.length != 0) {
      // Check if the line number is in the highlight list provided
      if (highlightLineNumbersArray.indexOf(currentLineNumber) != -1) {
        writeHighlight = true
      }
    }

    if (writeLine == true) {
      outputLine = ""

      if (writeHighlight == true) {
        outputLine += highlightCharacter
      }

      restOfLine = fileSplit[i]

      if (shouldTrimWhitespace == true) {
        restOfLine = restOfLine.substr(whiteSpaceToTrim, restOfLine.length)
      }

      // Remove whitespace if highlight is written
      // Otherwise an extra space is rendered
      if (writeHighlight && restOfLine.substring(0, 1) == " ") {
        restOfLine = restOfLine.substr(1, restOfLine.length)
      }

      outputLine += restOfLine

      output += outputLine + "\n"
    }

    currentLineNumber += 1
  }

  output += "```"

  return output;
}

// Downloads the file, adds the lines, and highlights the lines
IncludeSourceMacro.prototype.getFileExtension = function(filename) {
  fileExtension = filename.substr(filename.lastIndexOf(".") + 1, filename.length)

  if (fileExtension == "hql") {
    // Change HQL's extension to SQL
    fileExtension = "sql"
  }

  return fileExtension
}

// Calculates the minimum whitespace in the included lines
IncludeSourceMacro.prototype.calculateMinWhitespace = function(fileSplit, includeLineNumbersArray) {
  whitespaceCurrentLineNumber = 1

  currentMin = Number.MAX_VALUE

  for (var i = 0; i < fileSplit.length; i++) {
    // Is the line entirely whitespace?
    if (fileSplit[i].trim().length != 0) {
      writeLine = true

      // Included line numbers provided
      if (includeLineNumbersArray != undefined) {
        // Check if the line number is in the list provided
        if (includeLineNumbersArray.indexOf(whitespaceCurrentLineNumber) == -1) {
          writeLine = false
        }
      }

      if (writeLine == true) {
        // See what the minimum whitespace size is by left trimming
        currentMin = Math.min(currentMin, fileSplit[i].length - fileSplit[i].replace(/^\s*/g, "").length)
      }
    }

    whitespaceCurrentLineNumber += 1
  }

  return currentMin
}

// Gets the ranges to include
IncludeSourceMacro.prototype.mixrange = function(s) {
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
IncludeSourceMacro.prototype.range = function(start, stop, step){
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

// Map of URL to ajax call object
IncludeSourceMacro.prototype.allIncludeAjaxCalls = {};

// First step that goes through and downloads all includes.
IncludeSourceMacro.prototype.downloadAllIncludes = function(source, callbackfunction) {
  ajaxCalls = IncludeSourceMacro.prototype.downloadIncludes(source)
  
  if (ajaxCalls === undefined) {
    // There weren't any Ajax calls in the source.
    // Run the callback now
    callbackfunction()
  } else {
    // There were Ajax calls. Wait for them to finish and
    // then callback. Always continue, even if the Ajax 
    // calls fail.
    ajaxCalls.then(function() {
      callbackfunction()
    });
  }
}

// Goes through all source and downloads the includes.
IncludeSourceMacro.prototype.downloadIncludes = function(source) {
  // Import any includemodule
  var m;
  var re = /!\[:includesource (.*?)[\],]/g;

  ajaxCalls = []

  // Keep on running Regex until all includesource are found
  while ((m = re.exec(source)) !== null) {
    // See if the file was already downloaded
    sourceFilePath = m[1]

    if (!(sourceFilePath in IncludeSourceMacro.prototype.allIncludeAjaxCalls)) {
      ajaxCall = $.ajax({
        url: sourceFilePath,
        originalUrl: sourceFilePath,
        cache: false,
        beforeSend: function(jqXHR, settings) {
          // Add the URL so it can be accessed during an error
          jqXHR.url = settings.originalUrl;
        }
      }).fail(function(jqxhr, textStatus, errorThrown) {
        console.log("Source file: " + jqxhr.url + " could not be found and added to map of all source code. Status code:" + 
          jqxhr.status)
      })

      ajaxCalls.push(ajaxCall)
      IncludeSourceMacro.prototype.allIncludeAjaxCalls[sourceFilePath] = ajaxCall
    }
  }

  return IncludeSourceMacro.prototype.some(ajaxCalls)
}

// From http://stackoverflow.com/a/23625847
IncludeSourceMacro.prototype.some = function(promises) {
  var d = $.Deferred(), results = [];
  var remaining = promises.length;
  for(var i = 0; i < promises.length; i++){
      promises[i].then(function(res){
          results.push(res); // on success, add to results
      }).always(function(res){
          remaining--; // always mark as finished
          if(!remaining) {
            d.resolve(results);
          }
      })
  }

  if (promises.length == 0) {
    // There weren't any Ajax calls in the source.
    // Return undefined to show nothing is promised.
    return undefined;
  } else {
    // There were Ajax calls. Return a promise on the remaining values
    return d.promise();
  }
}