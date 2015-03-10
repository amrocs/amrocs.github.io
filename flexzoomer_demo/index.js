//------------------------------------------------
// FlexZoomer Demo
//------------------------------------------------
"use strict";
(function(){
//------------------------------------------------
// color generator
var getColor = function(x, y){
    var r = 100 + (Math.abs(x) % 5) * 30;
    var g = 100 + (x % 5) * 30;
    var b = 100 + (Math.abs(y) % 5) * 30;
    
    return "rgb(" + r + "," + g + "," + b + ")";
};

//------------------------------------------------
// Draw function (using tile.pos, tile.size)
var draw1 = function(tile){
    var val = Math.abs(tile.pos.x + tile.pos.y) % 3;
    
    if(val == 0){ //Div tile
        var font = Math.floor(tile.size.w / 6) + "px 'Times New Roman'";
        var fill_style = getColor(tile.pos.x, tile.pos.y);
        
        tile.div
            .css("font", font)
            .css("text-align", "center")
            .css("color", "#000000")
            .css("background-color", fill_style)
            .css("opacity", 0.9);
        
        tile.image = $("<img/>")
            .attr("src", "images/building.jpg")
            .css("width", tile.size.w)
            .css("height", tile.size.h)
            .appendTo(tile.div);
        
    }else if(val === 1){ //Canvas tile
        var canvas = $("<canvas>")
            .attr("width", tile.size.w)
            .attr("height", tile.size.h)
            .appendTo(tile.div);
        
        var ctx = canvas.get(0).getContext('2d');
        
        ctx.fillStyle = getColor(tile.pos.x, tile.pos.y);
        ctx.globalAlpha = 0.9;
        
        ctx.clearRect(0, 0, tile.size.w, tile.size.h); 
        ctx.fillRect(0, 0, tile.size.w, tile.size.h);  //x, y, w, h
        
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = Math.floor(tile.size.w / 6) + "px 'Times New Roman'";
        ctx.fillStyle = "#000000";
        ctx.fillText("Canvas", tile.size.w / 2, tile.size.h / 2);
        ctx.textBaseline = "top";
        ctx.fillText("x:" + tile.pos.x + " y:" + tile.pos.y, tile.size.w / 2, tile.size.h / 2);  //str, x, y
    
    }else{
        $("<div>").appendTo(tile.div)
            .css({
                "margin": "25% auto",
                "text-align": "center",
                "font": Math.floor(tile.size.w / 6) + "px 'Times New Roman'",
            })
            .html("Div<br />" + "x:" + tile.pos.x + " y:" + tile.pos.y);
    }
};

//----------------------------------------------------------------
// Basic Sample
//----------------------------------------------------------------
var sampleBasic = function(){
    var zmBasic = new FlexZoomer({containerId: "zoom_basic"});
    var range = {x: {min: -10, max: 10}, y: {min: -10, max: 10}};
    
    zmBasic.zoomLevels([
        {//level 0
            tileSize : {w: 50, h: 50},
            range : range,
            drawFunc : draw1,
        },
        {//level 1
            tileSize : {w: 100, h: 100},
            range : range,
            drawFunc : draw1,
        },
        {//level 2
            tileSize : {w: 200, h: 200},
            range : range,
            drawFunc : draw1,
        },
        {//level 3
            tileSize : {w: 400, h: 400},
            range : range,
            drawFunc : draw1,
        },
        {//level 4
            tileSize : {w: 800, h: 800},
            range : range,
            drawFunc : draw1,
        },
    ]);

    //initial position
    zmBasic.position(0);
};

//----------------------------------------------------------------
// Synchronize Sample
//----------------------------------------------------------------
var sampleSynchronize = function(){
    var zmSync1 = new FlexZoomer({containerId: "zoom_synchro1"});
    var zmSync2 = new FlexZoomer({containerId: "zoom_synchro2"});
    var range = {x: {min: -5, max: 5}, y: {min: -5, max: 5}};
    
    zmSync1.zoomLevels([
        {//level 0
            tileSize : {w: 50, h: 50},
            range : range,
            drawFunc : draw1,
        },
        {//level 1
            tileSize : {w: 100, h: 100},
            range : range,
            drawFunc : draw1,
        },
    ]);
    zmSync2.zoomLevels([
        {//level 0
            tileSize : {w: 50, h: 50},
            range : range,
            drawFunc : draw1,
        },
        {//level 1
            tileSize : {w: 100, h: 100},
            range : range,
            drawFunc : draw1,
        },
    ]);

    zmSync1.position(0); //initial position
    zmSync2.position(0); //initial position
    zmSync1.synchronize(zmSync2); //Synchronize
};

//----------------------------------------------------------------
// Scroll Range Sample
//----------------------------------------------------------------
var sampleScrollRange = function(){
    var zmFlexRange = new FlexZoomer({containerId: "zoomer_flex_range"});
    zmFlexRange.zoomLevels([
        {//level 0
            tileSize : {w: 50, h: 50},
            drawFunc : draw1,
        },
    ]);
    zmFlexRange.position(0);
    
    $("#range_flex_range").on("change", function(e){
        console.log(e);
        console.log($(this).val());
        var val = $(this).val(); 
        zmFlexRange.setAttr(0, {range: {x: {min: -val, max: val}, y: {min: -val, max: val}}});
    });
    $("#range_flex_range").val(1);
    $("#range_flex_range").change();
};

//----------------------------------------------------------------
// on Document Load
//----------------------------------------------------------------
$(window).load(function(){
    sampleBasic();
    sampleSynchronize();
    sampleScrollRange();
});

//--------------------------------------------------------
})();
