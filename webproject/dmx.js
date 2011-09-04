/**
 * @author Pensoffsky
 */


var commands = new Array();
var timeoutID;

var dmxStringCGIUrl = "../cgi-bin/dmxString?value=";
 
function getLightboxWallArray(){				
	//array
	lboxes = new Array(3);
	lboxes [0] = new Array(5);
	lboxes [1] = new Array(5);
	lboxes [2] = new Array(5);
	
	//column 0
	lboxes [0][0] = 0;
	lboxes [0][1] = 7;
	lboxes [0][2] = 1;
	lboxes [0][3] = 2;
	lboxes [0][4] = 4;
	
	//column 1
	lboxes [1][0] = 5;
	lboxes [1][1] = 6;
	lboxes [1][2] = 10;
	lboxes [1][3] = 8;
	lboxes [1][4] = 13;
	
	//column 2
	lboxes [2][0] = 14;
	lboxes [2][1] = 11;
	lboxes [2][2] = 3;
	lboxes [2][3] = 9;
	lboxes [2][4] = 12;
	
	return lboxes;
}

function getDmxStringForColum(idOfColumn, red, green, blue){
	var dmxString = "";
	var lboxes = getLightboxWallArray();
	
	for (var i=0; i < lboxes[idOfColumn].length; i++) {
		dmxString += getDmxStringForLightBox(lboxes[idOfColumn][i], red, green, blue);
	};
	
	return dmxString;	
}

function getDmxStringForRow(idOfrow, red, green, blue){
	var dmxString = "";
	var lboxes = getLightboxWallArray();
	
	for (var i=0; i < lboxes.length; i++) {
		dmxString += getDmxStringForLightBox(lboxes[i][idOfrow], red, green, blue);
	};
	
	return dmxString;
}
 
function getDmxStringForLightBox(lightboxID, red, green, blue){
	var dmxString = "";
	dmxString = getDmxStringForChannel((lightboxID*4) + 1, red);
	dmxString += getDmxStringForChannel((lightboxID*4) +2, green);
	dmxString += getDmxStringForChannel((lightboxID*4) +3, blue);
	return dmxString;
}
 
function getDmxStringForChannel(channel, value){
	return "oy" + channel + "c" + value + "w"; 
}         	

function startAnimationRemote(commandArray, newDmxStringCGIUrl){
	dmxStringCGIUrl = newDmxStringCGIUrl;
	startAnimation(commandArray);	
}	        	
         
function startAnimation(commandArray){
	commands = commandArray;
	timeoutID = setTimeout('popAndExecute();',10);	
}	        	
         	
/*function testAnimation(ui,e){         		
	commands = new Array();
	commands.push("oy1c50w");
	commands.push(2000);
	commands.push("oy1c0w");
	commands.push("oy2c50w");
	commands.push(2000);
	commands.push("oy2c0w");
	commands.push("oy3c50w");
	commands.push(2000);
	commands.push("oy3c0w");
	commands.reverse();
	
	timeoutID = setTimeout('popAndExecute();',100);
}*/
         	
function stopAnimation(){
	clearTimeout(timeoutID);
	commands = new Array();
}         	
         	
function popAndExecute(){
	//var poppedCommand = commands.pop();
	var poppedCommand = commands.shift();
	commands.push(poppedCommand);
	var timeout = 0;
	
	if((typeof poppedCommand) == "number"){
		//a delay command
		timeout = poppedCommand;
	}else{
		
		var bla = dmxStringCGIUrl + poppedCommand;
		//var bla = "../cgi-bin/dmxString?value="+poppedCommand;
 		doIt(this,event,bla);
 		//alert(bla);
	}
	
	if(commands.length > 0)
		timeoutID = setTimeout('popAndExecute();',timeout);	
}

function pausecomp(millis) 
{
	var date = new Date();
	var curDate = null;
	
	do { curDate = new Date(); } 
	while(curDate-date < millis);
}

function setChannelToValue(channel, value){
	var parameters = "../cgi-bin/dmx?value=" + value + "&channel=" + channel; 
	doIt(this, null, parameters);
	//alert(parameters);
}


function log(msg){
  if (window.console && console.log) {
    console.log(msg); //for firebug
  }
  document.write(msg); //write to screen
  $("#logBox").append(msg); //log to container
}


function doIt(ui, e, scripPath) {

	//erstellen des requests
	var req = null;
	try {
		req = new XMLHttpRequest();
	} catch (ms) {
		try {
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (nonms) {
			try {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (failed) {
				req = null;
			}
		}
	}
	if(req == null)
		alert("Error creating request object!");

	//anfrage erstellen (GET, url ist localhost,
	//request ist asynchron
	req.open("GET", scripPath, true);
	//Beim abschliessen des request wird diese Funktion ausgeführt
	req.onreadystatechange = function() {
		switch(req.readyState) {
			case 4:
				if(req.status != 200) {
					//alert("Fehler:"+req.status);
				} else {
					//alert(req.responseText);
				}
				break;

			default:
				return false;
				break;
		}
	};
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send(null);
}