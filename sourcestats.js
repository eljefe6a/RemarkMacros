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
SourceStats.prototype.outputStats = function(slideshow, slidesPerHour, hoursPerDay, demoMultiplier, exerciseMultiplier) {
  // Check if the optional parameters are added
  if (typeof hoursPerDay == 'undefined') {
    hoursPerDay = 6.5
  }

  if (typeof demoMultiplier == 'undefined') {
    demoMultiplier = 1
  }

  if (typeof exerciseMultiplier == 'undefined') {
    exerciseMultiplier = 1
  }

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

  chapterTimes = {}
  chapterTimes["chapters"] = []

  for (var i = 0; i < slides.length; i++) {
    var template = slides[i].properties.template;

    if (template == "chapter") {
      chapters++;

      if (chapters != 0) {
        chapterTimes["chapters"].push(this.outputChapterTime(regular, demoMinutes, exerciseMinutes, slidesPerHour, chapters, currentChapterName, currentSlides, currentExerciseMinutes, currentDemoMinutes, hoursPerDay))

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
      var minutes = parseInt(slides[i].properties.minutes) * demoMultiplier
      demoMinutes += minutes;
      currentDemoMinutes += minutes;
    } else if (template == "exercise") {
      var minutes = parseInt(slides[i].properties.minutes) * exerciseMultiplier
      exerciseMinutes += minutes;
      currentExerciseMinutes += minutes;
    }
  }

  chapterTimes["chapters"].push(this.outputChapterTime(regular, demoMinutes, exerciseMinutes, slidesPerHour, chapters, currentChapterName, currentSlides, currentExerciseMinutes, currentDemoMinutes, hoursPerDay))

  chapterTimes["total"] = {
    "totalchapters": chapters,
    "totalsections": sections,
    "totalregular": regular,
    "totaldemos": demoMinutes,
    "totalexercises": exerciseMinutes,
    "slidesperhour": slidesPerHour
  }

  this.displayChapters(chapterTimes)
}

SourceStats.prototype.outputChapterTime = function(regular, demoMinutes, exerciseMinutes, slidesPerHour, chapters, currentChapterName, currentSlides, currentExerciseMinutes, currentDemoMinutes, hoursPerDay) {
  chapterTime = this.calculateTime(regular, demoMinutes, exerciseMinutes, slidesPerHour, hoursPerDay)

  chapterMap = {
    "overallruntimedays": chapterTime[0],
    "overallruntimeminutes": chapterTime[1],
    "chapter": chapters,
    "chaptername": currentChapterName,
    "chapterslides": currentSlides,
    "chapterexerciseminutes": currentExerciseMinutes,
    "chapterdemominutes": currentDemoMinutes,
    "chaptertotaltime": ((currentSlides * (60 / slidesPerHour)) + currentExerciseMinutes + currentDemoMinutes).toFixed()
  }

  return chapterMap
}

// Calculates the current run time
SourceStats.prototype.calculateTime = function(slides, demo, exercise, slidesPerHour, hoursPerDay) {
  var totalMinutes = ((slides / slidesPerHour) * 60) + demo + exercise
  
  var days = Math.ceil(totalMinutes / (60 * hoursPerDay))

  var minutes = (totalMinutes - ((days - 1) * hoursPerDay * 60)).toFixed()

  return [days, minutes]
}

SourceStats.prototype.toHHMM = function(minutes) {
  realMinutes = minutes % 60
  hours = (minutes - realMinutes) / 60

  return this.pad(hours, 1) + ":" + this.pad(realMinutes, 2)
}

SourceStats.prototype.pad = function(value, length) {
    return (value.toString().length < length) ? this.pad("0"+value, length):value;
}

SourceStats.prototype.displayChapters = function(chapterTimes) {
  slidesPerMinute = 60 / chapterTimes["total"]["slidesperhour"]

  html = ""

  for (var i = 0; i < chapterTimes["chapters"].length; i++) {
    totalSlideTime = chapterTimes["chapters"][i]["chapterslides"] * slidesPerMinute

    html += chapterTimes["chapters"][i]["chaptername"]
    html += " D" + chapterTimes["chapters"][i]["overallruntimedays"] + " " + this.toHHMM(chapterTimes["chapters"][i]["overallruntimeminutes"])
    html += "     " + chapterTimes["chapters"][i]["chapterslides"]
    html += " " + this.toHHMM(chapterTimes["chapters"][i]["chaptertotaltime"])
    html += " " + this.toHHMM(totalSlideTime.toFixed())
    html += " " + this.toHHMM(chapterTimes["chapters"][i]["chapterexerciseminutes"])
    html += " " + this.toHHMM(chapterTimes["chapters"][i]["chapterdemominutes"]) + "\n"
  }

  slidesPerMinute = 60 / chapterTimes["total"]["slidesperhour"]
  totalSlideTime = chapterTimes["total"]["totalregular"] * slidesPerMinute
  totalCourseTime = totalSlideTime + chapterTimes["total"]["totaldemos"] + chapterTimes["total"]["totalexercises"]

  html += "\n\n"

  html += "Total Time: " + this.toHHMM(totalCourseTime.toFixed()) + "\n"
  html += "Total Slides: " + chapterTimes["total"]["totalregular"] + "\n"
  html += "Total Slide Time: " + this.toHHMM(totalSlideTime.toFixed()) + "\n"
  html += "Total Demos: " + this.toHHMM(chapterTimes["total"]["totaldemos"]) + "\n"
  html += "Total Exercises: " + this.toHHMM(chapterTimes["total"]["totalexercises"]) + "\n"

  html += (((chapterTimes["total"]["totaldemos"] + chapterTimes["total"]["totalexercises"]) / totalCourseTime) * 100).toFixed(1) + "% of class time is exercises/demos"

  console.log(html)
}
