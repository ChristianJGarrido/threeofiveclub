var map = {
    map: null,
    eventMarkers: [],
    temp:[],

    initialize: function() {
        var nyCoord = new google.maps.LatLng(40.7127,-74.0059);
        var canvas = document.getElementById("map-canvas");
        /*canvas.style.width = app.style.width;
        canvas.style.height = app.style.height;
        */
        this.map = new google.maps.Map(document.getElementById("map-canvas"), {
          zoom: 16,
          center: nyCoord,
        });
        //this.addMarker(40.7127,-74.0059);
        this.setupHandlers();
        this.plotEvents(false, false, "show-all");
    },

    setupHandlers: function(){
      $("#update-map-events").click(function(){
        var preference, visited
        if (Parse.User.current()){
          visited = $("#map-event-visited").prop("checked");
          preference = $("#map-event-preference").prop("checked");
        }else{
          visited = preference = false;
        }
        var timeframe = $("#map-event-timeframe input[type=radio]:checked").attr("id");
        map.plotEvents(visited, preference, timeframe);
      });
    },

    addMarker: function(lat, lon, id){
      var temp = this.eventMarkers[this.eventMarkers.length] = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lon),
        map: this.map,
        eventId: id,
      });

      google.maps.event.addListener(temp, 'click', function(){
        app.drawEventPage(temp.eventId);
      });

      return temp;
    },

    plotEvents: function(showVisited, showPreference, timeframe){
      var query = new Parse.Query(Event);
      var endDate = new Date();
      switch (timeframe){
        case "show-day":
        endDate.setDate(endDate.getDate() + 1); 
        break;
        case "show-week":
        endDate.setDate(endDate.getDate() + 7); 
        break;
        case "show-month":
        endDate.setMonth(endDate.getMonth() + 1); 
        break;
        case "show-year":
        endDate.setYear(endDate.getYear() + 1); 
        break;
        default:
        break;
      }
      if (timeframe !== "show-all"){
        query.lessThanOrEqualTo("time",endDate);
      }
      if (!showVisited){
       query.greaterThanOrEqualTo("time", new Date());
     }
      that = this;
      query.find({
        success: function(result){
            for (var i = 0; i < map.eventMarkers.length; i++) {
              map.eventMarkers[i].setMap(null); //clear markers
            }
            map.eventMarkers = result;
            var temp;
            for (var i = 0; i < result.length / 2; i++){ //absolutely no clue why it duplicates as you go along the list
                temp = result[i].get("location").toJSON();
                map.eventMarkers[i] = that.addMarker(temp.latitude, temp.longitude, result[i].id);
            }
        },
        error: function(error){
            console.dir(error);
        }
    });
  },
};