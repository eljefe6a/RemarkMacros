var DownloadManager = function () {
  console.log("Started DownloadManager")
};

DownloadManager.prototype.getFile = function(url, callbackfunction) {
  var jqxhr = $.ajax({
  url: url,
  cache: false
  })
  .done(function() {
    callbackfunction(jqxhr.responseText)
  })
  .fail(function() {
    console.log(url + " could not be found and added to source. Status code:" + 
      jqxhr.status + " Response:\n\"" + jqxhr.responseText + "\"")
  });
}


// Map of URL to ajax call object
DownloadManager.prototype.allIncludeAjaxCalls = {};
DownloadManager.prototype.urlsArray = [];

DownloadManager.prototype.addURL = function(url) {
  DownloadManager.prototype.urlsArray.push(url)
}

DownloadManager.prototype.downloadAll = function(callbackfunction) {
  ajaxCalls = DownloadManager.prototype.download()

  if (ajaxCalls === undefined) {
    // There weren't any Ajax calls in the source.
    // Run the callback now
    callbackfunction(DownloadManager.prototype.allIncludeAjaxCalls)
  } else {
    // There were Ajax calls. Wait for them to finish and
    // then callback. Always continue, even if the Ajax 
    // calls fail.
    ajaxCalls.then(function() {
      callbackfunction(DownloadManager.prototype.allIncludeAjaxCalls)
    });
  }
}

DownloadManager.prototype.download = function() {
  ajaxCalls = []

  for (var i = 0; i < DownloadManager.prototype.urlsArray.length; i++) {
    var url = DownloadManager.prototype.urlsArray[i];

    if (!(url in DownloadManager.prototype.allIncludeAjaxCalls)) {
      ajaxCall = $.ajax({
        url: url,
        originalUrl: url,
        cache: false,
        beforeSend: function(jqXHR, settings) {
          // Add the URL so it can be accessed during an error
          jqXHR.url = settings.originalUrl;
        }
      }).fail(function(jqxhr, textStatus, errorThrown) {
        console.log("URL: " + jqxhr.url + " could not be found and added. Status code:" + 
          jqxhr.status)
      })

      ajaxCalls.push(ajaxCall)
      DownloadManager.prototype.allIncludeAjaxCalls[url] = ajaxCall
    }
  }

  return DownloadManager.prototype.some(ajaxCalls)
}

// From http://stackoverflow.com/a/23625847
DownloadManager.prototype.some = function(promises) {
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