var SourceStats = function () {
};

// Downloads the sourceUrls and returns the results in Remark format
SourceStats.prototype.createSource = function(classJSONUrl) {
  // Download class file
  classfile = this.getFile(classJSONUrl)
  classJSON = JSON.parse(classfile)

  // Set the class title
  document.title = classJSON.classname

  var source = ""

  // Add all modules for the class
  for (var i = 0; i < classJSON.classmodules.length; i++) {
    source += this.getFile(classJSON.classmodules[i]);

    // Files shouldn't have --- at the head or foot
    // It is added automatically here
    if (i + 1 < classJSON.classmodules.length) {
      source += "\n---\n"
    }
  };

  return source
}

SourceStats.prototype.getFile = function(url) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open('GET', url, false);
  xmlhttp.send();

  if (xmlhttp.status != 200) {
    console.log(url + " could not be found and added to source.")
    return ""
  }

  return xmlhttp.responseText;
}

// Outputs timings and stats
SourceStats.prototype.outputStats = function(slideshow, slidesPerHour) {
  var slides = slideshow.getSlides()

  var chapters = -1;
  var sections = 0;
  var regular = 0;
  var demoMinutes = 0;
  var exerciseMinutes = 0;

  var currentSlides = 0;
  var currentDemoMinutes = 0;
  var currentExerciseMinutes = 0;
  var currentChapterName = ""

  for (var i = 0; i < slides.length; i++) {
    var template = slides[i].properties.template;

    if (template == "chapter") {
      chapters++;

      if (chapters != 0) {
        this.outputChapterTime(regular, demoMinutes, exerciseMinutes, slidesPerHour, chapters, currentChapterName, currentSlides, currentExerciseMinutes, currentDemoMinutes)

        currentSlides = 0;
        currentExerciseMinutes = 0;
        currentDemoMinutes = 0;
      }

      currentChapterName = slides[i].properties.name;
    } else if (template == "section") {
      sections++;
    } else if (template == "regular" || template == "code" || template == "image") {
      regular++;
      currentSlides++;
    } else if (template == "demo") {
      var minutes = parseInt(slides[i].properties.minutes)
      demoMinutes += minutes;
      currentDemoMinutes += minutes;
    } else if (template == "exercise") {
      var minutes = parseInt(slides[i].properties.minutes)
      exerciseMinutes += minutes;
      currentExerciseMinutes += minutes;
    }
  }

  this.outputChapterTime(regular, demoMinutes, exerciseMinutes, slidesPerHour, chapters, currentChapterName, currentSlides, currentExerciseMinutes, currentDemoMinutes)

  console.log("Overall stats chapters:" + chapters + " sections:" + sections +
   " regular:" + regular + " demos:" + demoMinutes + " exercises:" + exerciseMinutes +
   " slidesPerHour:" + slidesPerHour)
}

SourceStats.prototype.outputChapterTime = function(regular, demoMinutes, exerciseMinutes, slidesPerHour, chapters, currentChapterName, currentSlides, currentExerciseMinutes, currentDemoMinutes) {
  var toLog = this.calculateTime(regular, demoMinutes, exerciseMinutes, slidesPerHour) + 
    " Chapter " + chapters + " " + currentChapterName +
    " - " + currentSlides + " slides."

  if (currentExerciseMinutes != 0) {
    toLog += " " + currentExerciseMinutes + " minutes of exercises."
  }

  if (currentDemoMinutes != 0) {
    toLog += " " + currentDemoMinutes + " minutes of demos."
  }

  toLog += " Total chapter time: " + ((currentSlides * (60 / slidesPerHour)) + currentExerciseMinutes + currentDemoMinutes).toFixed(0) + " minutes."

  console.log(toLog)
}

// Calculates the current run time
SourceStats.prototype.calculateTime = function(slides, demo, exercise, slidesPerHour) {
  var totalMinutes = ((slides / slidesPerHour) * 60) + demo + exercise
  var hoursPerDay = 6.5

  var days = Math.ceil(totalMinutes / (60 * hoursPerDay))

  var hours = (totalMinutes - ((days - 1) * hoursPerDay * 60)) / 60

  return "Day " + days + " " + hours.toFixed(2) + " hours"
}
