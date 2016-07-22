var SourceStats = function () {
};

SourceStats.prototype.chapters = []

// Outputs timings and stats
SourceStats.prototype.outputStats = function(slideshow, params) {
  // params["hoursPerDay"],
  //  params["demoMultiplier"], params["exerciseMultiplier"]

  var slides = slideshow.getSlides()

  var currentChapter = -1;
  var currentSection = -1;
  var currentSlide = 0;

  for (var i = 0; i < slides.length; i++) {
    var template = slides[i].properties.template;

    if (template == "chapter" || template == "title") {
      currentChapter++;

      SourceStats.prototype.chapters[currentChapter] = {}

      SourceStats.prototype.chapters[currentChapter].name = slides[i].properties.name;
      
      // Reset sections
      SourceStats.prototype.chapters[currentChapter].sections = [];
      currentSection = -1;
    } else if (template == "section") {
      currentSection++;

      currentSlide = SourceStats.prototype.createSection(currentChapter, currentSection, slides[i].properties.name)
    } else if (template == "regular" || template == "code" || template == "image") {
      if (typeof SourceStats.prototype.chapters[currentChapter].sections[currentSection] == 'undefined') {
        currentSection++;

        currentSlide = SourceStats.prototype.createSection(currentChapter, currentSection, "section")
      }

      SourceStats.prototype.chapters[currentChapter].sections[currentSection].slides[currentSlide] = {
        type: "regular"
      }

      currentSlide++
    } else if (template == "demo") {
      SourceStats.prototype.chapters[currentChapter].sections[currentSection].slides[currentSlide] = {
        type: "demo",
        minutes: parseInt(slides[i].properties.minutes) * params["demoMultiplier"]
      }

      currentSlide++
    } else if (template == "exercise") {
      SourceStats.prototype.chapters[currentChapter].sections[currentSection].slides[currentSlide] = {
        type: "exercise",
        minutes: parseInt(slides[i].properties.minutes) * params["exerciseMultiplier"]
      }

      currentSlide++
    } else if (template == "final") {
      SourceStats.prototype.chapters[currentChapter].sections[currentSection].slides[currentSlide] = {
        type: "final",
        minutes: parseInt(slides[i].properties.minutes) * params["exerciseMultiplier"]
      }

      currentSlide++
    }
  }

  SourceStats.prototype.enrichChaptersAndSections(params)

  SourceStats.prototype.displayChapters(params)
}

SourceStats.prototype.createSection = function(currentChapter, currentSection, sectionName) {
  SourceStats.prototype.chapters[currentChapter].sections[currentSection] = {}

  SourceStats.prototype.chapters[currentChapter].sections[currentSection].name = sectionName;
  SourceStats.prototype.chapters[currentChapter].sections[currentSection].slides = []

  return 0
}

SourceStats.prototype.enrichChaptersAndSections = function(params) {
  for (var i = 0; i < SourceStats.prototype.chapters.length; i++) {
    var chapterRegular = 0
    var chapterSlideTime = 0
    var chapterDemoMinutes = 0
    var chapterExerciseMinutes = 0
    var chapterFinalMinutes = 0
    var chapterTotalMinutes = 0

    for (var j = 0; j < SourceStats.prototype.chapters[i].sections.length; j++) {
      var sectionRegular = 0
      var sectionSlideTime = 0
      var sectionDemoMinutes = 0
      var sectionExerciseMinutes = 0

      for (var k = 0; k < SourceStats.prototype.chapters[i].sections[j].slides.length; k++) {
        slidetype = SourceStats.prototype.chapters[i].sections[j].slides[k].type

        if (slidetype == "regular") {
          sectionRegular++
        } else if (slidetype == "demo") {
          sectionDemoMinutes += SourceStats.prototype.chapters[i].sections[j].slides[k].minutes
        } else if (slidetype == "exercise") {
          sectionExerciseMinutes += SourceStats.prototype.chapters[i].sections[j].slides[k].minutes
        } else if (slidetype == "final") {
          chapterFinalMinutes += SourceStats.prototype.chapters[i].sections[j].slides[k].minutes
        }
      }

      sectionSlideTime = ((sectionRegular / params["slidesperhour"]) * 60)

      // Enrich the sections
      SourceStats.prototype.chapters[i].sections[j]["sectionRegular"] = sectionRegular
      SourceStats.prototype.chapters[i].sections[j]["sectionSlideTime"] = sectionSlideTime
      SourceStats.prototype.chapters[i].sections[j]["sectionDemoMinutes"] = sectionDemoMinutes
      SourceStats.prototype.chapters[i].sections[j]["sectionExerciseMinutes"] = sectionExerciseMinutes
      SourceStats.prototype.chapters[i].sections[j]["sectionTotalMinutes"] = 
        sectionSlideTime + sectionDemoMinutes + sectionExerciseMinutes

      chapterRegular += sectionRegular
      chapterSlideTime += sectionSlideTime
      chapterDemoMinutes += sectionDemoMinutes
      chapterExerciseMinutes += sectionExerciseMinutes
      chapterTotalMinutes += SourceStats.prototype.chapters[i].sections[j]["sectionTotalMinutes"]
    }

    // Enrich the chapters
    SourceStats.prototype.chapters[i]["chapterRegular"] = chapterRegular
    SourceStats.prototype.chapters[i]["chapterSlideTime"] = chapterSlideTime
    SourceStats.prototype.chapters[i]["chapterDemoMinutes"] = chapterDemoMinutes
    SourceStats.prototype.chapters[i]["chapterExerciseMinutes"] = chapterExerciseMinutes
    SourceStats.prototype.chapters[i]["chapterFinalMinutes"] = chapterFinalMinutes
    SourceStats.prototype.chapters[i]["chapterTotalMinutes"] = chapterTotalMinutes
  }
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

  return this.pad(hours, 1) + ":" + this.pad(parseInt(realMinutes), 2)
}

SourceStats.prototype.pad = function(value, length) {
    return (value.toString().length < length) ? this.pad("0"+value, length):value;
}

SourceStats.prototype.displayChapters = function(params) {
  html = ""

  namePad = 50
  dayPad = 9
  numSlidesPad = 2
  chapPad = 6
  slidePad = 6
  exerPad = 6
  demoPad = 6

  var totalSlides = 0;
  var totalDemo = 0;
  var totalExercise = 0;
  var totalFinal = 0;
  var totalSlideTime = 0;

  // Output header
  html += s.rpad("Name", namePad, " ") + s.rpad("Day", dayPad, " ") + s.rpad("#", numSlidesPad + 1, " ") +
     s.rpad("Chap", chapPad, " ") + s.rpad("Slide", slidePad, " ") + s.rpad("Exer", exerPad, " ") +
     s.rpad("Demo", demoPad, " ") + "\n"

  for (var i = 0; i < SourceStats.prototype.chapters.length; i++) {
    totalSlides += SourceStats.prototype.chapters[i].chapterRegular
    totalDemo += SourceStats.prototype.chapters[i].chapterDemoMinutes
    totalExercise += SourceStats.prototype.chapters[i].chapterExerciseMinutes

    if (params["includeFinals"] == true) {
      totalExercise += SourceStats.prototype.chapters[i].chapterFinalMinutes
    }
    
    totalFinal += SourceStats.prototype.chapters[i].chapterFinalMinutes
    totalSlideTime += SourceStats.prototype.chapters[i].chapterSlideTime

    daysMinutes = SourceStats.prototype.calculateTime(totalSlides, totalDemo, totalExercise, params["slidesperhour"], params["hoursPerDay"])
    runningTime = "D" + daysMinutes[0] + " " + this.toHHMM(daysMinutes[1])

    html += s.rpad(SourceStats.prototype.chapters[i].name, namePad, " ");
    html += s.rpad(runningTime, dayPad, " ");
    html += s.lpad(SourceStats.prototype.chapters[i].chapterRegular, numSlidesPad, " ") + " ";
    html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].chapterTotalMinutes), chapPad, " ");
    html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].chapterSlideTime), slidePad, " ");
    html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].chapterExerciseMinutes + 
      SourceStats.prototype.chapters[i].chapterFinalMinutes), exerPad, " ");
    html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].chapterDemoMinutes), demoPad, " ");
    html += "\n"

    // Output section information
    if (params["outputSections"] == true) {
      for (var j = 0; j < SourceStats.prototype.chapters[i].sections.length; j++) {
        html += "  " + s.rpad(SourceStats.prototype.chapters[i].sections[j].name, namePad - 2, " ")
        // Position in day isn't calculated for sections
        html += s.rpad("", dayPad, " ");
        html += s.lpad(SourceStats.prototype.chapters[i].sections[j].sectionRegular, numSlidesPad, " ") + " ";
        html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].sections[j].sectionTotalMinutes), chapPad, " ");
        html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].sections[j].sectionSlideTime), slidePad, " ");
        html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].sections[j].sectionExerciseMinutes), exerPad, " ");
        html += s.rpad(this.toHHMM(SourceStats.prototype.chapters[i].sections[j].sectionDemoMinutes), demoPad, " ");
        html += "\n"
      }
    }
  }

  totalCourseTime = totalDemo + totalExercise + totalSlideTime
  
  if (params["includeFinals"] == true) {
   totalCourseTime =+ totalFinal
  }

  html += "\n\n"

  html += "Total Time: " + this.toHHMM((totalCourseTime)) + "\n"
  html += "Total Slides: " + totalSlides + "\n"
  html += "Total Slide Time: " + this.toHHMM(totalSlideTime) + "\n"
  html += "Total Demos: " + this.toHHMM(totalDemo) + "\n"
  html += "Total Exercises: " + this.toHHMM(totalExercise) + "\n"
  html += "Total Finals: " + this.toHHMM(totalFinal) + "\n"

  exerciseDemoPercent = (((totalDemo + totalExercise + totalFinal) / totalCourseTime) * 100).toFixed(1)
  html += exerciseDemoPercent + "% of class time is exercises/demos"

  console.log(html)
}
