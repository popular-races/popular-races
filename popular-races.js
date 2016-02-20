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
  map.setView(new L.LatLng(lat,lon), 14);
  new L.CircleMarker([lat,lon],{radius: 4}).addTo(map);
}

function main() {
  map = new L.Map('map', {
        center: [43.36,-8.41],
        zoom: 14
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
      detectUserLocation();
    }).on('error', function() {
      //log the error
    });
}

// function main() {
//   cartodb.createVis('map', 'http://psanxiao.cartodb.com/api/v2/viz/f283f2c0-8539-11e3-a110-3085a9a9563c/viz.json', {
//     shareable: false,
//     title: false,
//     description: false,
//     search: false,
//     tiles_loader: true,
//     mobile_layout: true,
//     center_lat: 43.36,
//     center_lon: -8.41,
//     zoom: 14
//   })
//   .done(function(vis, layers) {
//             // layer 0 is the base layer, layer 1 is cartodb layer
//             // setInteraction is disabled by default
//             layers[1].setInteraction(true);
//             layers[1].on('featureOver', function(e, pos, latlng, data) {
//               cartodb.log.log(e, pos, latlng, data);
//             });

//             var subLayer = layers[1].getSubLayer(0);
//             filterByType(subLayer);
//             filterByDate(subLayer);
//             detectUserLocation();
//           })
//   .error(function(err) {
//     console.log(err);
//   });
// }

window.onload = main;
