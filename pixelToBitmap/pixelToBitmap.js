//************************************************
// Pixel colors array to Bitmap image
//************************************************
'use strict';
//--------------------------------------------------------
// convert integer to hex. (little endian)
//--------------------------------------------------------
var intToHexLE = function (val, byteCount) {
  var hex = '';
  for (var i = 0; i < byteCount; i++) {
    hex += ('0' + ((val >> 8 * i) & 0xFF).toString(16)).substr(-2);
  }
  return hex;
};
  
//--------------------------------------------------------
// convert pixel square array of color (#RRGGBB) to bitmap image
//--------------------------------------------------------
var pixelToBitmap = function (colorArr) {
  // file header
  var fileHeader = [
    '424D',     // Signature as bitmap
    '00000000', // File size
    '0000',     // Reserved1
    '0000',     // Reserved2
    '00000000'  // File Offset to PixelArray
  ];
  
  // info header
  var infoHeader = [
    '28000000', // Info header size
    '00000000', // Image Width
    '00000000', // Imate Height
    '0100',     // Planes
    '2000',     // Bits per pixel ('2000' -> 32bit color (no pallet))
    '00000000', // Compression
    '00000000', // Image Size
    '00000000', // X Pixels Per Meter
    '00000000', // Y Pixels Per Meter
    '00000000', // Colors in Color Table
    '00000000'  // Important color Count
  ];
  
  // image data
  var img = [];
  var imgH = colorArr.length;
  var imgW;
  for (var y = imgH - 1; y >= 0; y--) { // 下から描画するので注意
    imgW = colorArr[y].length;
    for (var x = 0; x < imgW; x++) {
      img.push(
        colorArr[y][x].substr(5, 2)
        + colorArr[y][x].substr(3, 2)
        + colorArr[y][x].substr(1, 2)
        + '00'
      );
    }
  }
  
  // update size info
  var headerSize = (fileHeader.join('') + infoHeader.join('')).length * 0.5;
  var imgSize = (img.join('')).length * 0.5;
  
  fileHeader[1] = intToHexLE(headerSize + imgSize, 4); // update file size
  fileHeader[4] = intToHexLE(headerSize, 4); // update header size
  
  infoHeader[1] = intToHexLE(imgW, 4); // update image width
  infoHeader[2] = intToHexLE(imgH, 4); // update image height
  infoHeader[6] = intToHexLE(imgSize, 4); // update image size
  
  // create bitmap image
  var data = fileHeader.join('') + infoHeader.join('') + img.join('');
  var bytes = new Uint8Array(data.length / 2); // Convert the string to bytes

  for (var i = 0; i < data.length; i += 2) {
    bytes[i / 2] = parseInt(data.substring(i, i + 2), 16);
  }
  var blob = new Blob([bytes], {type: 'image/bmp'});
  var image = new Image(imgW, imgH);
  image.src = URL.createObjectURL(blob);
  
  return image;
};
