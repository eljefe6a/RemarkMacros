var SourceStats = function () {
};

SourceStats.prototype.chapters = []

// Outputs timings and stats
SourceStats.prototype.outputStats = function(sourceObj, params) {
  for (var chapterindex = 0; chapterindex < sourceObj.chapters.length; chapterindex++) {
    chapter = sourceObj.chapters[chapterindex]

    if (chapter.privateheader.included == false) {
      continue;
    }

    chapter.privateheader.chapterRegular = 0
    chapter.privateheader.chapterSlideTime = 0
    chapter.privateheader.chapterDemoMinutes = 0
    chapter.privateheader.chapterExerciseMinutes = 0
    chapter.privateheader.chapterFinalMinutes = 0
    chapter.privateheader.chapterTotalMinutes = 0

    for (var sectionindex = 0; sectionindex < sourceObj.chapters[chapterindex].sections.length; sectionindex++) {
      section = sourceObj.chapters[chapterindex].sections[sectionindex]

      if (section.privateheader.included == false) {
        continue;
      }

      section.privateheader.slidesInSection = 0
      section.privateheader.demoMinutes = 0
      section.privateheader.exerciseMinutes = 0
      section.privateheader.finalMinutes = 0

      for (var slideindex = 0; slideindex < sourceObj.chapters[chapterindex].sections[sectionindex].slides.length; slideindex++) {
        slide = sourceObj.chapters[chapterindex].sections[sectionindex].slides[slideindex]
        
        if (slide.privateheader.included == true) {
          template = slide.header.template

          if (template == "demo") {
            section.privateheader.demoMinutes += parseInt(slide.header.minutes * params["demoMultiplier"])
          } else if (template == "exercise") {
            section.privateheader.exerciseMinutes += parseInt(slide.header.minutes * params["exerciseMultiplier"])
          } else if (template == "final") {
            section.privateheader.finalMinutes += parseInt(slide.header.minutes * params["exerciseMultiplier"])
          } else {
            section.privateheader.slidesInSection += 1
          }
        }

        section.privateheader.totalSlideTime = ((section.privateheader.slidesInSection / params["slidesperhour"]) * 60)
        section.privateheader.totalMinutes = section.privateheader.totalSlideTime + section.privateheader.demoMinutes + section.privateheader.exerciseMinutes + section.privateheader.finalMinutes
      }

      chapter.privateheader.chapterRegular += section.privateheader.slidesInSection
      chapter.privateheader.chapterSlideTime += section.privateheader.totalSlideTime
      chapter.privateheader.chapterDemoMinutes += section.privateheader.demoMinutes
      chapter.privateheader.chapterExerciseMinutes += section.privateheader.exerciseMinutes
      chapter.privateheader.chapterFinalMinutes += section.privateheader.finalMinutes
      chapter.privateheader.chapterTotalMinutes += section.privateheader.totalMinutes
    }
  }

  SourceStats.prototype.displayChapters(sourceObj, params)
}

SourceStats.prototype.displayChapters = function(sourceObj, params) {
  html = ""

  namePad = 50
  dayPad = 9
  numSlidesPad = 2
  chapPad = 6
  slidePad = 6
  exerPad = 6
  demoPad = 6
  finalPad = 6

  var totalSlides = 0;
  var totalDemo = 0;
  var totalExercise = 0;
  var totalFinal = 0;
  var totalSlideTime = 0;

  // Output header
  html += s.rpad("Name", namePad, " ") + s.rpad("Day", dayPad, " ") + s.rpad("#", numSlidesPad + 1, " ") +
     s.rpad("Chap", chapPad, " ") + s.rpad("Slide", slidePad, " ") + s.rpad("Exer", exerPad, " ") +
     s.rpad("Demo", demoPad, " ") + s.rpad("Finl", finalPad, " ") + "\n"

  for (var i = 0; i < sourceObj.chapters.length; i++) {
    chapter = sourceObj.chapters[i]

    if (chapter.privateheader.included == false) {
      continue;
    }

    totalSlides += chapter.privateheader.chapterRegular
    totalDemo += chapter.privateheader.chapterDemoMinutes
    totalExercise += chapter.privateheader.chapterExerciseMinutes

    if (params["includeFinals"] == true) {
      totalExercise += chapter.privateheader.chapterFinalMinutes
    }
    
    totalFinal += chapter.privateheader.chapterFinalMinutes
    totalSlideTime += chapter.privateheader.chapterSlideTime

    daysMinutes = SourceStats.prototype.calculateTime(totalSlides, totalDemo, totalExercise, params["slidesperhour"], params["hoursPerDay"])
    runningTime = "D" + daysMinutes[0] + " " + this.toHHMM(daysMinutes[1])

    html += s.rpad(chapter.header.name, namePad, " ");
    html += s.rpad(runningTime, dayPad, " ");
    html += s.lpad(chapter.privateheader.chapterRegular, numSlidesPad, " ") + " ";
    html += s.rpad(this.toHHMM(chapter.privateheader.chapterTotalMinutes), chapPad, " ");
    html += s.rpad(this.toHHMM(chapter.privateheader.chapterSlideTime), slidePad, " ");
    html += s.rpad(this.toHHMM(chapter.privateheader.chapterExerciseMinutes), exerPad, " ");
    html += s.rpad(this.toHHMM(chapter.privateheader.chapterDemoMinutes), demoPad, " ");
    html += s.rpad(this.toHHMM(chapter.privateheader.chapterFinalMinutes), finalPad, " ");
    html += "\n"

    // Output section information
    if (params["outputSections"] == true) {
      for (var j = 0; j < chapter.sections.length; j++) {
        section = sourceObj.chapters[i].sections[j]

        if (section.privateheader.included == false) {
          continue;
        }

        html += "  " + s.rpad(section.header.name, namePad - 2, " ")
        // Position in day isn't calculated for sections
        html += s.rpad("", dayPad, " ");
        html += s.lpad(section.privateheader.slidesInSection, numSlidesPad, " ") + " ";
        html += s.rpad(this.toHHMM(section.privateheader.totalMinutes), chapPad, " ");
        html += s.rpad(this.toHHMM(section.privateheader.totalSlideTime), slidePad, " ");
        html += s.rpad(this.toHHMM(section.privateheader.exerciseMinutes), exerPad, " ");
        html += s.rpad(this.toHHMM(section.privateheader.demoMinutes), demoPad, " ");
        // Finals aren't calculated for sections
        html += s.rpad("", finalPad, " ");
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

  if (params["includeFinals"] == true) {
    totalDemoExceriseFinals = totalDemo + totalExercise + totalFinal
  } else {
    totalDemoExceriseFinals = totalDemo + totalExercise
  }

  exerciseDemoPercent = ((totalDemoExceriseFinals / totalCourseTime) * 100).toFixed(1)
  html += exerciseDemoPercent + "% of class time is exercises/demos"

  console.log(html)
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
