var map;
var tipo = 'all';
var date = 'all';
var distance = 'all';
var query;

var lat;
var lon;

function filterByType(layer) {
  var sql = new cartodb.SQL({ user: 'documentation' });

  var $options = $('#type_selector li');
  $options.click(function(e) {
            // get the area of the selected layer
            var $li = $(e.target);
            tipo = $li.attr('data');

            // deselect all and select the clicked one
            $options.removeClass('active');
            $li.addClass('active');

            query = getQuery();

            // change the query in the layer to update the map
            layer.setSQL(query);
          });
}

function filterByDate(layer) {
  var sql = new cartodb.SQL({ user: 'documentation' });

  var $options = $('#date_selector li');
  $options.click(function(e) {
            // get the area of the selected layer
            var $li = $(e.target);
            date = $li.attr('data');

            // deselect all and select the clicked one
            $options.removeClass('active');
            $li.addClass('active');

            query = getQuery();

            // change the query in the layer to update the map
            layer.setSQL(query);
          });
}

function filterByDistance(layer) {
  var sql = new cartodb.SQL({ user: 'documentation' });

  var $options = $('#distance_selector li');
  $options.click(function(e) {
            // get the area of the selected layer
            var $li = $(e.target);
            distance = $li.attr('data');

            // deselect all and select the clicked one
            $options.removeClass('active');
            $li.addClass('active');

            query = getQuery();

            // change the query in the layer to update the map
            layer.setSQL(query);
          });
}

function getQuery() {
  if(date !== 'all' && tipo !== 'all' &&  distance != 'all') {
    query = getTypeAndDateAndDistanceQuery();
  } else if (tipo !== 'all' && date != 'all') {
    query = getTypeAndDateQuery();
  } else if (tipo !== 'all' && distance != 'all') {
    query = getTypeAndDistanceQuery();
  } else if (date != 'all' && distance != 'all') {
    query = getDateAndDistanceQuery();
  } else if (tipo !== 'all') {
    query = getTypeQuery();
  } else if (date !== 'all') {
    query = getDateQuery();
  } else if (distance !== 'all') {
    query = getDistanceQuery();
  } else {
    query = getAllDataQuery();
  }
  return query;
}

function getAllDataQuery() {
  return "SELECT * FROM carreras_coru_u00f1a";
}

function getTypeQuery() {
  return "SELECT * FROM carreras_coru_u00f1a WHERE tipo = '" + tipo + "'";
}

function getDateQuery() {
  return "SELECT * FROM carreras_coru_u00f1a WHERE date between current_timestamp"
  + " AND current_timestamp + interval '" + date + "'";
}

function getDistanceQuery() {
  return "SELECT * FROM carreras_coru_u00f1a"
  + " WHERE (ST_Distance(CDB_LatLng(" + lat + "," + lon + ")::geography,"
  + " the_geom::geography)/1000) <= " + distance;
}

function getTypeAndDateAndDistanceQuery() {
    return "SELECT * FROM carreras_coru_u00f1a WHERE tipo = '" + tipo + "'"
    + " AND date between current_timestamp AND current_timestamp + interval '" + date + "'"
    + " AND (ST_Distance(CDB_LatLng(" + lat + "," + lon + ")::geography,"
    + " the_geom::geography)/1000) <= " + distance;
}

function getTypeAndDateQuery() {
  return "SELECT * FROM carreras_coru_u00f1a WHERE tipo = '" + tipo + "'"
  + " AND date between current_timestamp AND current_timestamp + interval '" + date + "'"
}

function getTypeAndDistanceQuery() {
  return "SELECT * FROM carreras_coru_u00f1a WHERE tipo = '" + tipo + "'"
  + " AND (ST_Distance(CDB_LatLng(" + lat + "," + lon + ")::geography,"
  + " the_geom::geography)/1000) <= " + distance;
}

function getDateAndDistanceQuery() {
  return "SELECT * FROM carreras_coru_u00f1a WHERE date between current_timestamp"
  + " AND current_timestamp + interval '" + date + "'"
  + " AND (ST_Distance(CDB_LatLng(" + lat + "," + lon + ")::geography,"
  + " the_geom::geography)/1000) <= " + distance;
}

// credit: http://html5doctor.com/finding-your-position-with-geolocation/
function detectUserLocation(){
  if (navigator.geolocation) {
    var timeoutVal = 10 * 1000 * 1000;
    navigator.geolocation.watchPosition(
      mapToPosition,
      alertError,
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
    );
  }
  else {
    alert("Geolocation is not supported by this browser");
  }

  function alertError(error) {
    var errors = {
      1: 'Permission denied',
      2: 'Position unavailable',
      3: 'Request timeout'
    };
    alert("Error: " + errors[error.code]);
  }
}

function mapToPosition(position) {
  lon = position.coords.longitude;
  lat = position.coords.latitude;
  //map.setView(new L.LatLng(lat,lon), 14);
  new L.CircleMarker([lat,lon],{radius: 4}).addTo(map);
}

function addNewRace() {
  var raceName = $('#race_name').val();
  var raceDistance = $("#race_distance").val();
  var raceDate = $('#race_date').val();
  var raceLocation = $('#race_location').val();
  var raceType = $("form input[type='radio']:checked").val();

  var dt = new Date(raceDate);
  var dateUTC = dt.toUTCString();
  var dateLocale = dt.toLocaleDateString();

  var api_key = '1c2a1d97a8027051895922a9b51573cdd52553e8';
  var sql = "https://psanxiao.cartodb.com/api/v2/sql?q=INSERT INTO carreras_coru_u00f1a (the_geom, nombre, distancia, fecha, tipo, date)"
  + " VALUES (cdb_geocode_namedplace_point('" + raceLocation + "'), '" + raceName + "', '" + raceDistance + "', '" + dateLocale + "', '" + raceType + "', '" + dateUTC + "')&api_key=" + api_key;

  $.post( sql, function( data ) {
     console.log(data);
   });

   $('#myModalHorizontal').modal('toggle');
   alert("New race added");
}

function main() {
  map = new L.Map('map', {
        center: [42.91,-7.78],
        zoom: 9
      })

      L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
        attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
      }).addTo(map);

  var layerUrl = 'http://psanxiao.cartodb.com/api/v2/viz/f283f2c0-8539-11e3-a110-3085a9a9563c/viz.json';

  var sublayers = [];

  cartodb.createLayer(map, layerUrl)
    .addTo(map)
    .on('done', function(layer) {

      var sublayer = layer.getSubLayer(0);

      sublayers.push(sublayer);
      filterByType(sublayer);
      filterByDate(sublayer);
      filterByDistance(sublayer);

    }).on('error', function() {
      //log the error
    });
}
detectUserLocation();
window.onload = main;
