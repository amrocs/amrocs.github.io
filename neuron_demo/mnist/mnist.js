//************************************************
//
//  Javascript MNIST Library
//
//    dependency: jQuery
//
//************************************************
"use strict";
//--------------------------------------------------------
var Mnist = function(argOptions){
    //default options
    var defaults = {
        trainCount: 60000,
        testCount: 10000,
        trainImageFile: null,
        trainLabelFile: null,
        testImageFile: null,
        testLabelFile: null,
        LoopIncrementCountOfEachTimeout: 10,
    };
    
    //mnist object 
    var my = {
        data: {
            train:{
                labels: [],
            },
            test:{
                labels: [],
            }
        },
        options: $.extend({}, defaults, argOptions),
    };
    
    //--------------------------------------------------------
    //read label data (is number. for example 2,7,6,4,1,4,...)
    my.readLabels = function(file, labelArray){
        var reader = new FileReader();
        var blob = file.slice(0, file.size);
        var dfd = $.Deferred();
        
        reader.onloadend = function(e) {
            if(e.target.readyState == FileReader.DONE) { // DONE == 2
                console.log("start: reading labels");
                var dView = new DataView(e.target.result);
                var magicNum = dView.getInt32(0, false);
                var itemCount = dView.getInt32(4, false);
                var p = 8;
                
                for(var i = 0; i < itemCount; i++){
                    var answer = dView.getUint8(p++, false)
                    labelArray.push(answer);
                }
                
                console.log("end: reading labels");
                dfd.resolve();
            }
        };
        
        reader.readAsArrayBuffer(blob);
        return dfd.promise();
    };
    
    //--------------------------------------------------------
    //read image data (is 28*28 pixel data)
    my.readImages = function(imageFile, count, labelArray, onImageRead){
        var reader = new FileReader();
        var blob = imageFile.slice(0, imageFile.size);
        var dfd = $.Deferred();
        var queue = [];
        
        reader.onloadend = function(e) {
            if(e.target.readyState == FileReader.DONE){ // DONE == 2
                console.log("start: reading images");
                var dView = new DataView(e.target.result);
                var magicNum = dView.getInt32(0, false);
                var imageCount = dView.getInt32(4, false);
                var imageHeight = dView.getInt32(8, false);
                var imageWidth = dView.getInt32(12, false);
                var p = 16;
                
                var iterator = function(start){
                    for(var i = start; i < start + my.options.LoopIncrementCountOfEachTimeout; i++){
                        if(count-1 < i){
                            dfd.resolve();
                            console.log("end: reading images");
                            return;
                        }
                        
                        var imageData = [];
                        for(var y = 0; y < imageHeight; y++){
                            imageData[y] = [];
                            for(var x = 0; x < imageWidth; x++){
                                var pixel = dView.getUint8(p++, false);
                                imageData[y][x] = pixel;
                            }
                        }
                        
                        onImageRead(i, labelArray[i], imageData);
                    }
                    
                    setTimeout( function(){ iterator(i);}, 0); //"setTimeou" is used to avoid browser freeze
                }
                
                iterator(0);
            }
        };
        
        //
        reader.readAsArrayBuffer(blob);
        return dfd.promise();
    };
    
    //--------------------------------------------------------
    my.readTrainImages = function(onImageRead){
        return my.readImages(my.options.trainImageFile, my.options.trainCount, my.data.train.labels, onImageRead);
    };
    
    //--------------------------------------------------------
    my.readTestImages = function(onImageRead){
        return my.readImages(my.options.testImageFile, my.options.testCount, my.data.test.labels, onImageRead);
    };
    
    //--------------------------------------------------------
    my.readTrainLabels = function(){
        return my.readLabels(my.options.trainLabelFile, my.data.train.labels);
    };
    
    //--------------------------------------------------------
    my.readTestLabels = function(){
        return my.readLabels(my.options.testLabelFile, my.data.test.labels);
    };
    
    //--------------------------------------------------------
    //start train and test
    my.start = function(onTrainImageRead, onTestImageRead){
        return $.when(
            my.readTrainLabels(),
            my.readTestLabels()
        ).then(
            function(){
                $.when(
                    my.readTrainImages( onTrainImageRead )
                ).then(
                    function(){
                        my.readTestImages( onTestImageRead );
                    }
                );
            },
            function(){
            }
        );
    };
    
    //--------------------------------------------------------
    return my;
};

