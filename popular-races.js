function filterByType(layer) {
  var sql = new cartodb.SQL({ user: 'documentation' });

  var $options = $('#type_selector li');
  $options.click(function(e) {
            // get the area of the selected layer
            var $li = $(e.target);
            var tipo = $li.attr('data');

            // deselect all and select the clicked one
            $options.removeClass('active');
            $li.addClass('active');

            // create query based on data from the layer
            var query = "SELECT * FROM carreras_coru_u00f1a";

            if(tipo !== 'all') {
              query = "SELECT * FROM carreras_coru_u00f1a WHERE tipo = '" + tipo + "'";
            }

            // change the query in the layer to update the map
            layer.setSQL(query);
          });
}

function main() {
  cartodb.createVis('map', 'http://psanxiao.cartodb.com/api/v2/viz/f283f2c0-8539-11e3-a110-3085a9a9563c/viz.json', {
    shareable: false,
    title: false,
    description: false,
    search: false,
    tiles_loader: true,
    mobile_layout: true,
    center_lat: 43.36,
    center_lon: -8.41,
    zoom: 14
  })
  .done(function(vis, layers) {
            // layer 0 is the base layer, layer 1 is cartodb layer
            // setInteraction is disabled by default
            layers[1].setInteraction(true);
            layers[1].on('featureOver', function(e, pos, latlng, data) {
              cartodb.log.log(e, pos, latlng, data);
            });

            var subLayer = layers[1].getSubLayer(0);
            filterByType(subLayer);
          })
  .error(function(err) {
    console.log(err);
  });
}

window.onload = main;