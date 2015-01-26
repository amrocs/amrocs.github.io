//************************************************
//  jMNIST demo
//************************************************
"use strict";
(function(){
//--------------------------------------------------------
//main object
//--------------------------------------------------------
var my = {
    trainCount: 60000,
    testCount: 10000,
    files: [],
};

//--------------------------------------------------------
// draw number image
//--------------------------------------------------------
my.latestImageData = null;
my.$elCanvas = $("#mnist_image");
my.$elPreCanvas = $(document.createElement('canvas')); //hidden. pre-render to copy
my.$elPreCanvas.attr({width: my.$elCanvas.attr("width"), height: my.$elCanvas.attr("height")});

function render(){
    if(my.latestImageData !== null){
        var ctxPre = my.$elPreCanvas.get(0).getContext('2d');
        
        for(var y = 0; y < 28; y++){
            for(var x = 0; x < 28; x++){
                var val = my.latestImageData[y][x];
                ctxPre.fillStyle = 'rgb(' + '0' + ', ' + val + ', ' + val + ')';
                ctxPre.fillRect(x*2, y*2, 2, 2); //x, y, w, h
            }
        }
        
        $("#mnist_image").get(0).getContext('2d').drawImage(my.$elPreCanvas.get(0), 0, 0);
    }
    requestAnimationFrame(render);
};

//--------------------------------------------------------
// Callback process on training image read.
// This funciton called 60000 times.
//--------------------------------------------------------
var onTrainImageRead = function(index, label, image){
    $("#please_wait").hide();
    
    my.latestImageData = image;
    $("#mnist_label").html(label);
    $("#learn_time").html((index+1) + "/60000");
};

//--------------------------------------------------------
// Callback process on test image read
// This funciton called 10000 times.
//--------------------------------------------------------
var onTestImageRead = function(index, label, image){
    my.latestImageData = image;
    $("#mnist_label").html(label);
    $("#test_time").html((index+1) + "/10000");
};

//--------------------------------------------------------
$(window).load(function(){
    //------------------------------------------------
    // process on drop
    var onDropFile = function(e){
        e.preventDefault();
        
        var l = e.dataTransfer.files.length;
        for(var i = 0; i < l; i++){
            my.files.push( e.dataTransfer.files[i] );
            
            $("#" + e.dataTransfer.files[i].name.split(".")[0] + "_ok").show();
        }
        
        if($("#train-labels_ok").is(':visible')
            && $("#train-images_ok").is(':visible')
            && $("#t10k-labels_ok").is(':visible')
            && $("#t10k-images_ok").is(':visible')
        ){
            $("#btn_go").removeAttr('disabled');
        }
    };
    
    //------------------------------------------------
    // cancel default process
    var onCancel = function(e){
        if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    };
    $("#drop_area").get(0).addEventListener("drop", onDropFile, false);
    $(".container").get(0).addEventListener("dragover", onCancel, false);
    $(".container").get(0).addEventListener("dragenter", onCancel, false);
    
    //--------------------------------------------------------
    $("#btn_go").on('click', function(e){
        $("#please_wait").show();
        
        //check mnist files
        var trainImageFile;
        var trainLabelFile;
        var testImageFile;
        var testLabelFile;
        $.each(my.files, function(index, file){
            if(file.name.match(/train-images/)){
                trainImageFile = file;
            }else if(file.name.match(/train-labels/)){
                trainLabelFile = file;
            }else if(file.name.match(/t10k-images/)){
                testImageFile = file;
            }else if(file.name.match(/t10k-labels/)){
                testLabelFile = file;
            }else{
                return true;
            }
        });
        if(!trainImageFile || !trainLabelFile || !testImageFile || !testLabelFile){
            alert('All 4 files required.');
            return;
        }
        
        //create mnist object
        my.mnist = Mnist({
            trainCount: my.trainCount,
            testCount: my.testCount,
            trainImageFile: trainImageFile,
            trainLabelFile: trainLabelFile,
            testImageFile: testImageFile,
            testLabelFile: testLabelFile,
        });
        
        //start train and test
        my.mnist.start( onTrainImageRead, onTestImageRead );
        
        render();
    });
});
//--------------------------------------------------------
})();
