/**
 * Déroulement du jeu
 * Created by nguyen10 on 24/02/2016.
 */

$(document).ready(function(){
    $("button").click(function() {
        start();
    })

});

function start()   {
    $("button").replaceWith("<div id='map'></div><div class='jumbotron'><div id='gameStuff'></div></div>");

    var player = new Player(), mafia = new Mafia();
    var map = loadMap();

    $("#map").droppable({

        drop: function( event, ui ) {

            var idZoneDropped = ui.draggable.attr("value");
            var zone = player.getZone(idZoneDropped);
            matchMap(zone, map);



        }
    });

    setPlayerInMap(player, mafia, map);

}

function matchMap(zone, map) {

    //var address = zone.address;
    $.ajax({
        type: 'GET',
        url: "http://nominatim.openstreetmap.org/search",
        dataType: 'jsonp',
        jsonpCallback: 'data',
        data: { format: "json", limit: 1, q: zone.address,json_callback: 'data' },
        error: function(xhr, status, error) {
            alert("ERROR "+error);
        },
        success: function(data){

            var x = '',y ='';
            $.each(data, function() {
                x = this['lat'] ;
                y = this['lon'] ;
            });
            console.log('x',x);
            console.log('y',y);
            map.panTo(new L.LatLng(x, y));

        }
    });
}

function loadMap()   {
    var map = L.map('map').setView([48.853, 2.35], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia2loYW5zaSIsImEiOiJjaWtwaHkzcncwMGI4dm1tNmJ6cmh0cGNyIn0.TkCUMKGfLS0g76k16FSyNg', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 25,
        id: 'kihansi.p61khcg2',
        accessToken: 'pk.eyJ1Ijoia2loYW5zaSIsImEiOiJjaWtwaHkzcncwMGI4dm1tNmJ6cmh0cGNyIn0.TkCUMKGfLS0g76k16FSyNg'
    }).addTo(map);

    return map;
}

function setPlayerInMap(player, mafia, map)   {
    visualize(player,mafia,map);
    setAnim(player,mafia,map);

    player.marker(map);
    mafia.marker(map);
}

function setAnim(player, mafia, map)    {
    $( ".draggable" ).draggable({

        revert: function(event, ui) {
            $(this).data("uiDraggable").originalPosition={
                top:0,
                left:0
            };
            return true;
        }
    });
    $( ".droppable" ).droppable({
        drop: function( event, ui ) {

            var idZoneAttacker = ui.draggable.attr("value");
            var idZoneAttacked = $(this).attr("value");

            kill(player, idZoneAttacker, mafia, idZoneAttacked, map);

        }
    });
}

function kill(player, idAttacker, mafia, idAttacked,map)    {
    var newArrayZoneForPlayer = mafia.attackedIn(idAttacker,player.getZone(idAttacked));
    if(newArrayZoneForPlayer != null)
        player.takeZone(newArrayZoneForPlayer[0]);

    setPlayerInMap(player,mafia,map);
}