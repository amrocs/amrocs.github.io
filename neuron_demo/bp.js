//************************************************
//  MNIST Neural Network
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
    inputG: null,
    hiddenGroups1: [],
    outputG: null,
    files: [],
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
//学習画像データ読み込み時処理
//--------------------------------------------------------
var onTrainImageRead = function(index, image, label){
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
    }
};

//--------------------------------------------------------
//テスト画像データ読み込み時処理
//--------------------------------------------------------
var testCount = 0;
var correct = 0;
var incorrect = 0;
var onTestImageRead = function(index, image, label){
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
        console.log("test:" + str + " (" + testCount + " images tested)");
    }
};

//--------------------------------------------------------
//ロード時処理
$(window).load(function(){
    //------------------------------------------------
    // ドロップ時処理
    var onDropFile = function(e){
        e.preventDefault();
        
        var l = e.dataTransfer.files.length;
        for(var i = 0; i < l; i++){
            my.files.push( e.dataTransfer.files[i] );
        }
        $("#btn_go").removeAttr('disabled');
    };
    
    //------------------------------------------------
    // デフォルト処理をキャンセル
    var onCancel = function(e){
        if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    };
    $("#drop_area").get(0).addEventListener("drop", onDropFile, false);
    $(".container").get(0).addEventListener("dragover", onCancel, false);
    $(".container").get(0).addEventListener("dragenter", onCancel, false);
    
    //
    my.nn = jneuron();
    
    //Create Neuron Groups
    //input layer
    var sizeInputG = [28, 28];
    my.inputG = my.nn.createGroup({
        id: "input",
        counts: sizeInputG,
        fireFunction: softSign2,
        connectionW: 1,
        connectionH: 1,
    });
    my.inputGViewer = createGroupViewer({
        group: my.inputG,
        parentId: "input_layer_container",
        fireView: true,
        weightView: false,
        pixelRate: 2,
    });
    
    //hidden layer 1
    var sizeHidden1G = [5, 5];
    my.hidden1G = my.nn.createGroup({
        id: "hidden1",
        counts: sizeHidden1G,
        initWeightFuntion: getTriangularRandomFunction(-0.1, 0.1),
        fireFunction: logistic,
        fireProcess: fireBp,
        learnProcess: learnBp,
        connectionW: 28,
        connectionH: 28,
    });
    my.hidden1GViewer = createGroupViewer({
        group: my.hidden1G,
        parentId: "hidden1_layer_container",
        fireView: true,
        weightView: true,
        pixelRate: 1,
    });
    
    //output layer
    var sizeOutput = [1, 10];
    my.outputG = my.nn.createGroup({
        id: "output",
        counts: sizeOutput,
        initWeightFuntion: getTriangularRandomFunction(-0.6, 0.6),
        fireFunction: logistic,
        fireProcess: fireBp,
        learnProcess: learnBp,
        connectionW: 5,
        connectionH: 5,
    });
    my.outputGViewer = createGroupViewer({
        group: my.outputG,
        parentId: "output_layer_container",
        fireView: true,
        weightView: true,
        pixelRate: 2,
    });
    
    //--------------------------------------------------------
    //実行ボタン
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
        
        //network connecting
        my.inputG.connectTo( my.hidden1G );
        my.hidden1G.connectTo( my.outputG );
        resetBenchmark();
        
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
