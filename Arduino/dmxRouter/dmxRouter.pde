/* this programm converts serial input to dmx output
** oy1c255w - sets dmx channel 1 to value 255
** oy240c30w - sets dmx channel 240 to value 30
**
** op111bbb111 - op marks the start of block of data that gets sent as dmx.
** every byte after op gets set as value for a channel 
**
** uses serial input with 115200 baud
** 
** DmxSimple is used to send dmx
** http://code.google.com/p/tinkerit/wiki/DmxSimple
*/

#include <DmxSimple.h>

//#define DEBUGOUT

void setup() {
  Serial.begin(115200);
  
  //choose the pin to use as output for dmx
  DmxSimple.usePin(4);
  
#ifdef DEBUGOUT  
  //Serial.println("booted");
#endif
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
  
#ifdef DEBUGOUT  
  Serial.print("byte1:");
  Serial.println((int)byte1);
  Serial.print("byte2:");
  Serial.println((int)byte2);
#endif
  //reset channel when 
  if(byte1 == 'o' && byte2 == 'p')
  {    
    channel = 0;
#ifdef DEBUGOUT
    Serial.println("reset channel");
#endif
    return;    
  }else if(byte1 == 'o' && byte2 == 'y')
  {    
#ifdef DEBUGOUT
    Serial.println("enter single channel mode");
#endif
    readbytes = 0;
    readSingleChannel();
#ifdef DEBUGOUT
    Serial.println("exit single channel");
#endif
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
#ifdef DEBUGOUT
    Serial.println("max channel reached");
#endif
    return;
  }
  
  channel++;

#ifdef DEBUGOUT
  Serial.print("channel:");
  Serial.println((int)channel);  
  Serial.print("value:");
  Serial.println((int)byte2);
#endif  
  
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
        return;
      }
      value = 0;
    }
  }
}

