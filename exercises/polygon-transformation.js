process.stdin.resume();
process.stdin.setEncoding('ascii');

var input_stdin = "";
var input_stdin_array = "";

process.stdin.on('data', function (data) {
    input_stdin += data;
});

process.stdin.on('end', function () {
    input_stdin_array = input_stdin.split("\n");
    main();
});

function readLine(_line_number) {
    return input_stdin_array[_line_number];
}

function parseLine(_textArray){
    var stringArray = _textArray.split(" ");
    var intArray = [];
    for(var i=0;i<stringArray.length;i++){
        intArray.push(parseInt(stringArray[i]));
    }
    return intArray;
}

function printVector(v){
  var stringArr = " ";
  stringArr = Math.round(v[0]) + " " +  Math.round(v[1]) + " " +  Math.round(v[2]) + " " + Math.round(v[3]);
  return stringArr;
}

function translate(vector, tvector){
  var result = [];
  var aux =  [[1,0,0,tvector[0]],[0,1,0,tvector[1]],[0,0,1,tvector[2]],[0,0,0,1]];
  for (i = 0; i<vector.length; i++){
    result[i] = aux[i][0] * vector[0] +  aux[i][1] * vector[1] +  aux[i][2] * vector[2] +  aux[i][3] * vector[3];
  }
  return result;
}

function rotate(vector, angle){
  var result = [];
  var aux = [[Math.cos(angle* Math.PI / 180), -Math.sin(angle* Math.PI / 180), 0, 0],[Math.sin(angle* Math.PI / 180), Math.cos(angle* Math.PI / 180), 0, 0],[0, 0, 1, 0], [0, 0, 0, 1]];
  for (i = 0; i<vector.length; i++){
    result[i] = aux[i][0] * vector[0] +  aux[i][1] * vector[1] +  aux[i][2] * vector[2] +  aux[i][3] * vector[3];
  }
  return result;

}

function getOrigin(a, b, c) {
  var result = [];
  for (i = 0; i < 4; i++){
    result[i] = (a[i] + b[i] + c[i]) / 3;
  }
  return result;
}

function inverseVector(v) {
  var result = [];
  for (i = 0; i < 4; i++){
    result[i] = -v[i];
  }
  return result;
}

function main() {
  var a = parseLine(readLine(0));
  var b = parseLine(readLine(1));
  var c = parseLine(readLine(2));
  var angle = parseInt(readLine(3));
  var t = parseLine(readLine(4));

  var origin = getOrigin(a, b, c);

  var ap = translate(a, inverseVector(origin));
  var bp = translate(b, inverseVector(origin));
  var cp = translate(c, inverseVector(origin));

  var ra = rotate(ap, angle);
  var rb = rotate(bp, angle);
  var rc = rotate(cp, angle);

  var ap2 = translate(ra, origin);
  var bp2 = translate(rb, origin);
  var cp2 = translate(rc, origin);

  var fa = translate(ap2, t);
  var fb = translate(bp2, t);
  var fc = translate(cp2, t);

  console.log(printVector(fa));
  console.log(printVector(fb));
  console.log(printVector(fc));
}
