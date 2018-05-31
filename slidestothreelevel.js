var SlidesToThreeLevel = function () {
};


// Outputs timings and stats
SlidesToThreeLevel.prototype.outputThreeLevel = function(slideshow, outputDiv) {
  var slides = slideshow.getSlides()

  output = ""

  for (var i = 0; i < slides.length; i++) {
    var template = slides[i].properties.template;
    var slideName = slides[i].properties.name;

    console.log(template)

    if (template == "chapter" || template == "title") {
      output += slideName + "\n"
    } else if (template == "sectionlist") {
      output += "  " + slideName + "\n"
    } else if (template == "regular") {
      output += "    " + slideName + "\n"
    } else if (template == "code") {
      output += "    " + slideName + " #code\n"
    } else if (template == "image") {
      output += "    " + slideName + " #image\n"
    } else if (template == "demo") {
      var minutes = parseInt(slides[i].properties.minutes)
      output += "    " + slideName + " #demo " + minutes + "\n"
    } else if (template == "exercise") {
      var minutes = parseInt(slides[i].properties.minutes)
      output += "    " + slideName + " #exercise " + minutes + "\n"
    }
  }

  outputDiv.html(output)
}

SlidesToThreeLevel.prototype.addHandler = function() {
  $(document).ready(function () {

    $('body').on('keyup',function(e){
      if(e.which==84){
        var slidesToThreeLevel = new SlidesToThreeLevel();
        slidesToThreeLevel.outputThreeLevel(slideshow, $("#overlay"));
        $('#overlay').toggle()
      }
    });

    outputTextArea = $(document.createElement( "textarea" ))
    outputTextArea.css({
      "position":"absolute",
      "top":0,
      "left":0,
      "width":"100%",
      "height":"100%",
      "z-index":1000,
      "display":"none",
    });
   
    outputTextArea.attr("id","overlay")

    $("body").append(outputTextArea);
  });
}
