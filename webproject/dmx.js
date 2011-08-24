/**
 * @author Pensoffsky
 */




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