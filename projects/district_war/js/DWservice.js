/**
 * Définition des classes
 * Created by KIHANSI on 06/03/2016.
 * Notice*: this script much be included after Leaflet script.
 */

/**
 * Class Zone
 * @param name: name of the zone, this one will be the label in html
 * @param address: address in leaflet
 * @param x
 * @param y
 * @param population: determine the point
 * @constructor
 */
var Zone = function(name, address, x, y, population)  {
    this.name = name;
    this.address = address
    this.x = x;
    this.y = y;
    this.population = population;

    this.beingAttacked = function(attacker)    {
        this.population = (this.population > attacker.population)?this.population - attacker.population:0;
        return this.population;
    }

    this.attack = function(defender)    {
        defender.beingAttacked(this);
    }

    this.isDead = function()   {
        return this.population == 0;
    }

    this.setCoordinate = function(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Retourner une chaîne de html
     * @param player: boolean
     * @returns {string} code html
     */
    this.html = function(player, value)  {
        var anim = player ? "draggable" : "droppable";
        return  "<div class='col-lg-3 "+anim+"' value='"+value+"'>" +
                "   <div class='zone panel panel-success' >" +
                "       <div class='panel-heading'>" +
                "        <h3 class='panel-title'>"+this.name+"</h3>"+
                            this.address+"<br/>Pop: "+
                            this.population+
                "       </div>" +
                "   </div>" +
                "</div>";
    }
}

/**
 * Class Player
 * @returns {*[Zone]}
 * @constructor
 */
var Player = function() {

    this.zones = [
        new Zone("Gamer Gang","12 Quai du Marché Neuf, Paris",48.8536624,2.3468093,100),
        new Zone("Quai de la Corse","7 Quai de la corse, Paris",48.8552634,2.3494506,10)
    ];

    /**
     * Retourner une chaîne de html
     * @param player: boolean
     * @returns {string} code html
     */
    this.html = function(player)  {
        var htmlZone = "";
        for(var i = 0; i < this.zones.length; i++)  {
            htmlZone = htmlZone + this.zones[i].html(player,i);
        }
        return  "<div class='player panel panel-info'>" +
                "   <div class='panel-heading'>" +
                "       <h2 class='panel-title'>Player's zone</h2>" +
                "   </div>" +
                "   <div class='panel-body'>"+
                        htmlZone+
                "   </div>" +
                "</div>";
    }

    this.marker = function(map)    {
        for(var i = 0; i < this.zones.length; i++)
            L.marker([this.zones[i].x, this.zones[i].y], {icon: getIcon(this.zones[i],false)}).addTo(map).bindPopup("Aidez moi!");
    }

    this.getZone = function(index)  {
        return this.zones[index];
    }

    this.takeZone = function(zone)  {
        if(zone != null)
            this.zones.push(zone);
    }

}

/**
 * Class Mafia
 * @returns {*[Zone]}
 * @constructor
 */
var Mafia = function() {

    this.zones = [
        new Zone("Rue de la Cité","4 rue de la Cité, Paris",48.854187,2.347289,10),
        new Zone("Rue Saint Louis","38 rue Saint Louis en l'Île, Paris",48.8516637,2.3571299,10),
        new Zone("Hôtel de Ville","Hôtel de Ville, Paris",48.8564263,2.35252757801161,10)
    ];

    this.html = function(player)  {
        var htmlZone = "";
        for(var i = 0; i < this.zones.length; i++)  {
            htmlZone = htmlZone + this.zones[i].html(player,i);
        }
        return "<div class='mafia panel panel-danger'><div class='panel-heading'><h2 class='panel-title'>Mafia's zone</h2></div><div class='panel-body'>"+htmlZone+"</div></div>";
    }

    this.marker = function(map)    {
        for(var i = 0; i < this.zones.length; i++)
            L.marker([this.zones[i].x, this.zones[i].y], {icon: getIcon(this.zones[i],true), draggable: true}).addTo(map).bindPopup("Je suis mafia de zone "+this.zones[i].name);
    }

    this.getZone = function(index)  {
        return zones[index];
    }

    this.attackedIn = function(idZone, zonePlayer) {
        var zoneAttacked = this.zones[idZone];
        zoneAttacked.beingAttacked(zonePlayer);
        var zoneLost = [];
        if(zoneAttacked.isDead())   {
            zoneLost = this.zones.splice(idZone, 1);
        }
        return zoneLost;
    }
}

//Supposing that L is global variable. Using inside a function like a boss. Need to verify!
var getIcon = function(zone, mafia)    {

    var url = "";
    if(mafia)
        url = "img/mafia_icon.png";
    else
        url = "img/player_icon.jpg";

    return L.icon({
        iconUrl: url,
        iconSize: [30,30],
        iconAnchor: [15,0],
        popupAnchor: [0,0],
    })
}

var visualize = function(player, mafia, map)    {
    $("#gameStuff ").replaceWith("<div id='gameStuff'>"+player.html(true)+"<br/>"+mafia.html(false)+"</div>");
}