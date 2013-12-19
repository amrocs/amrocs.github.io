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
var drawImage = function(imageData){
    var ctx = $("#mnist_image").get(0).getContext('2d');
    
    for(var y = 0; y < 28; y++){
        for(var x = 0; x < 28; x++){
            var val = imageData[y][x];
            ctx.fillStyle = 'rgb(' + '0' + ', ' + val + ', ' + val + ')';
            ctx.fillRect(x*2, y*2, 2, 2); //x, y, w, h
        }
    }
}

//--------------------------------------------------------
// Callback process on training image read.
// This funciton called 60000 times.
//--------------------------------------------------------
var onTrainImageRead = function(index, image, label){
    $("#please_wait").hide();
    
    drawImage(image);
    $("#mnist_label").html(label);
    $("#learn_time").html((index+1) + "/60000");
};

//--------------------------------------------------------
// Callback process on test image read
// This funciton called 10000 times.
//--------------------------------------------------------
var onTestImageRead = function(index, image, label){
    drawImage(image);
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
        }
        $("#btn_go").removeAttr('disabled');
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
        my.mnist = jMnist({
            trainCount: my.trainCount,
            testCount: my.testCount,
            trainImageFile: trainImageFile,
            trainLabelFile: trainLabelFile,
            testImageFile: testImageFile,
            testLabelFile: testLabelFile,
        });
        
        //start train and test
        my.mnist.start( onTrainImageRead, onTestImageRead );
    });
});
//--------------------------------------------------------
})();
