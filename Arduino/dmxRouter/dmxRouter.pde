/* This program allows you to set DMX channels over the serial port.
**
** After uploading to Arduino, switch to Serial Monitor and set the baud rate
** to 9600. You can then set DMX channels using these commands:
**
** <number>c : Select DMX channel
** <number>v : Set DMX channel to new value
**
** These can be combined. For example:
** 100c355w : Set channel 100 to value 255.
**
** For more details, and compatible Processing sketch,
** visit http://code.google.com/p/tinkerit/wiki/SerialToDmx
**
** Help and support: http://groups.google.com/group/dmxsimple       */

#include <DmxSimple.h>

void setup() {
  Serial.begin(115200);
 
  
  //Serial.println("booted");
}

int value = 0;
int channel = 0;

byte byte1 = 0;
byte byte2 = 0;

int c;

int readbytes = 0;

//TODO wo wird denn herrausgefunden ob nur muell kommt?

void loop() {
  
  while(!Serial.available());
  c = Serial.read();
    
  byte1 = byte2;
  byte2 = (byte)c;
  
  /*Serial.print("byte1:");
  Serial.println((int)byte1);
  Serial.print("byte2:");
  Serial.println((int)byte2);*/
  
  //reset channel when 
  if(byte1 == 'o' && byte2 == 'p')
  {    
    channel = 0;
    Serial.println("reset channel");
    return;    
  }else if(byte1 == 'o' && byte2 == 'y')
  {    
    Serial.println("enter single channel mode");
    readbytes = 0;
    readSingleChannel();
    Serial.println("exit single channel");
    return;
  }
  else if(byte1 == 'o' && byte2 == 'o')
  {    
    //escaped o-value 
  }else if(byte2 == 'o')
  {    
    //wait for the next byte to see if 
    //to reset the channel or set the value for o
    //Serial.println("reset channel");
    return;
  }
  
  //check if the channel is to big or already invalid
  if(channel > 512 || channel == -1){
    channel = -1;
   //Serial.println("max channel reached");
    return;
  }
  
  channel++;

  /*Serial.print("channel:");
  Serial.println((int)channel);  
  Serial.print("value:");
  Serial.println((int)byte2);
  */
  
  DmxSimple.write(channel, byte2);
}




void readSingleChannel(){
  int c = 0; //character
  int value = 0; //value
  int channel = 0; //channel
    
  while(readbytes < 10){
   while(!Serial.available());
    c = Serial.read();
    readbytes++;
    
    if ((c>='0') && (c<='9')) {
      value = 10*value + c - '0';
    } else {
      if (c=='c') channel = value;
      else if (c=='w') {
        DmxSimple.write(channel, value);
        Serial.println();
        return;
      }
      value = 0;
    }
  }
}

