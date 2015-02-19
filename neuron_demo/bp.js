//************************************************
//  neuron.js Demo
//************************************************
"use strict";
(function(){
//--------------------------------------------------------
//For Speed Test
//--------------------------------------------------------
//Speed Test
var benchmark_ts = [];
var printBenchmark = function(label){
    benchmark_ts.push((new Date()).getTime());
    var l = benchmark_ts.length;
    console.log(label + ":" + (benchmark_ts[l - 1] - benchmark_ts[l - 2]) + "ms");
};
var resetBenchmark = function(){
    benchmark_ts = [(new Date()).getTime()];
};

//--------------------------------------------------------
//main object
//--------------------------------------------------------
var my = {
    trainCount: 500,
    testCount: 500,
    files: [],
    //For Back-Propagation Leaning
    inputG: null,
    hiddenGroups1: [],
    outputG: null,
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
// MNIST image to inputData
//--------------------------------------------------------
var getImageData = function(imageData){
    var fixedData = [];
    for(var y = 0; y < 28; y++){
        fixedData[y] = [];
        for(var x = 0; x < 28; x++){
            fixedData[y][x] = imageData[y][x] / 255;
        }
    }
    return fixedData;
};

//--------------------------------------------------------
//Teacher For Output Layer
var getTeacherData = function(label){
    var teacherData = [];
    for(var i = 0; i < 10; i++){
        if(i == label){
            teacherData.push(1);
        }else{
            teacherData.push(0);
        }
    }
    return [teacherData];
};

//--------------------------------------------------------
// on read Training Image
//--------------------------------------------------------
var onTrainImageRead = function(index, label, image){
    $("#please_wait").hide();
    
    my.latestImageData = image;
    $("#mnist_label").html(label);
    $("#learn_time").html((index+1) + "/60000");
    
    //
    var inputData = getImageData(image);
    var teacherData = getTeacherData(label);
    
    //set input and teacher
    my.inputG.setOutput(inputData);
    my.outputG.setTeacher(teacherData);
    
    //fire and learn
    my.hidden1G.fire();
    my.outputG.fire();
    my.outputG.learn();
    my.hidden1G.learn();
    
    //view
    $("#mnist_label").html(label);
    
    //Time
    var turn = index+1;
    if(turn % 100 == 0){
        printBenchmark("" + turn);
        $("#result_container").html("Now Training ...");
    }
};

//--------------------------------------------------------
// on read Test Image
//--------------------------------------------------------
var testCount = 0;
var correct = 0;
var incorrect = 0;
var onTestImageRead = function(index, label, image){
    my.latestImageData = image;
    $("#mnist_label").html(label);
    $("#test_time").html((index+1) + "/10000");
    
    var inputData = getImageData(image);
    var teacherData = getTeacherData(label);
    
    my.inputG.setOutput(inputData);
    my.hidden1G.fire();
    my.outputG.fire();
    
    var outputs = my.outputG.getOutput();
    var bestIndex = null;
    var bestValue = -Infinity;
    for(var i = 0; i < 10 ; i++){
        if(bestValue < outputs[0][i]){
            bestValue = outputs[0][i];
            bestIndex = i;
        }
    }
    
    $("#mnist_label").html(label);
    
    testCount++;
    if(bestIndex == label){
        correct++;
    }else{
        incorrect++;
    }
    
    if(testCount % 100 == 0){
        var str = ("" + (correct / testCount)).substr(0,6);
        $("#result_container").html("Accuracy:" + str + " (" + testCount + " images tested)");
    }
};

//--------------------------------------------------------
//On Page Load
$(window).load(function(){
    //------------------------------------------------
    // on Mnist files dropped 
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
    // 
    var onCancel = function(e){
        if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    };
    $("#drop_area").get(0).addEventListener("drop", onDropFile, false);
    $(".container").get(0).addEventListener("dragover", onCancel, false);
    $(".container").get(0).addEventListener("dragenter", onCancel, false);
    
    //--------------------------------
    //Create Neuron.js Objact
    my.nn = Neuron();
    
    //--------------------------------
    //Create Neuron Layers (Groups)
    //input layer
    my.inputG = my.nn.createGroup({
        id: "input layer",
        counts: [28, 28],
        connectionW: 1,
        connectionH: 1,
    });
    
    //hidden layer
    my.hidden1G = my.nn.createGroup({
        id: "hidden layer",
        counts: [5, 5],
        initWeightFuntion: getRandFuncTriangular(-0.1, 0.1),
        fireFunction: logistic,
        fireProcess: fireBp,
        learnProcess: learnBp,
        connectionW: 28,
        connectionH: 28,
    });
    
    //output layer
    my.outputG = my.nn.createGroup({
        id: "output layer",
        counts: [1, 10],
        initWeightFuntion: getRandFuncTriangular(-0.6, 0.6),
        fireFunction: logistic,
        fireProcess: fireBp,
        learnProcess: learnBp,
        connectionW: 5,
        connectionH: 5,
    });
    
    //--------------------------------
    //connect layer 
    my.inputG.connectTo( my.hidden1G );
    my.hidden1G.connectTo( my.outputG );
    
    //--------------------------------
    // Create Neural-Network Viewer for visual Understanding
    my.inputGViewer = createGroupViewer({
        group: my.inputG,
        parentId: "input_layer_container",
        fireView: true,
        weightView: false,
        pixelRate: 2,
    });
    
    my.hidden1GViewer = createGroupViewer({
        group: my.hidden1G,
        parentId: "hidden1_layer_container",
        fireView: true,
        weightView: true,
        pixelRate: 1,
    });
    
    my.outputGViewer = createGroupViewer({
        group: my.outputG,
        parentId: "output_layer_container",
        fireView: true,
        weightView: true,
        pixelRate: 2,
    });
    
    //--------------------------------------------------------
    //Start Learning and Test
    $("#btn_go").on('click', function(e){
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
        
        resetBenchmark();
        
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
