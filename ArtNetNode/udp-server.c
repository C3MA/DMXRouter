/* Sample UDP server */

#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h> /* Signal handling ... e.g. reacting on Ctrl+C */

#define TRUE					1
#define FALSE					0

// ----------------------------------------------------------------------------
// op-codes
#define OP_POLL				0x2000
#define OP_POLLREPLY			0x2100
#define OP_OUTPUT			0x0050 /* change the endianess ... */
#define OP_ADDRESS			0x6000 /* all other values are ignored, because wue don't use them */
#define OP_IPPROG			0xf800
#define OP_IPPROGREPLY			0xf900

#define MAX_DMX_SIZE	512
#define MAX_DMX_UC_LENGTH 200	/* maxlength the microcontroller could transfer */

void ex_program(int sig); /* Signal handling */

struct artnet_header {
 unsigned char  id[8];
 unsigned short opcode;
};

struct artnet_dmx {
	unsigned char  id[8];
	unsigned short opcode;
	unsigned char  versionH;
	unsigned char  version;
	unsigned char  sequence;
	unsigned char  physical;
	unsigned short universe;
	unsigned char  lengthHi;
	unsigned char  length;
	unsigned char  dataStart;
};

FILE *gSerialOutput = NULL;

int main(int argc, char**argv)
{
	(void) signal(SIGINT, ex_program); /* Signal handling */
   int sockfd,n, i, c;
   struct sockaddr_in servaddr,cliaddr;
   socklen_t len;
   char mesg[1024];
	int maxChannel = MAX_DMX_UC_LENGTH;
   struct artnet_dmx* dmx = NULL;
	
	char* device = NULL;
	
	/* ------------ read the given parameter -------------- */
	opterr = 0;
	while ((c = getopt (argc, argv, "hd:m:")) != -1)
		switch (c)
	{
		case 'd':
			device = optarg;
			break;
		case '?':
			if (optopt == 'd')
				fprintf (stderr, "Option -%c requires an argument.\n", optopt);
			else if (isprint (optopt))
				fprintf (stderr, "Unknown option `-%c'.\n", optopt);
			else
				fprintf (stderr,
						 "Unknown option character `\\x%x'.\n",
						 optopt);
			return 1;
		case 'm':
			maxChannel = atoi(optarg);
			break;
		case 'h':
		default:
			printf("Usage: %s -d <serial output device>\n", argv[0]);
			return 1;
	}
	
	if (device == NULL) {
		printf("Usage: %s -d <serial output device> -m <max channels>\n", argv[0]);			
		return 1;
	}

	/* --------- logic of the application ------- */
	
   sockfd=socket(AF_INET,SOCK_DGRAM,0);

   bzero(&servaddr,sizeof(servaddr));
   servaddr.sin_family = AF_INET;
   servaddr.sin_addr.s_addr=htonl(INADDR_ANY);
   servaddr.sin_port=htons(6454);
   bind(sockfd,(struct sockaddr *)&servaddr,sizeof(servaddr));
	
	
	gSerialOutput = fopen(device, "w");
	printf("The Artnet Server convert %d channels\n", maxChannel);
   for (;;)
   {
      len = sizeof(cliaddr);
      n = recvfrom(sockfd,mesg,1000,0,(struct sockaddr *)&cliaddr,&len);
//      sendto(sockfd,mesg,n,0,(struct sockaddr *)&cliaddr,sizeof(cliaddr));
      mesg[n] = 0;	   
	   dmx = (struct artnet_dmx *)mesg;
	   //check the id
	   if ( (dmx->id[0] != 'A') ||
		   (dmx->id[1] != 'r') ||
		   (dmx->id[2] != 't') ||
		   (dmx->id[3] != '-') ||
		   (dmx->id[4] != 'N') ||
		   (dmx->id[5] != 'e') ||
		   (dmx->id[6] != 't') ||
		   (dmx->id[7] !=  0 )    )
	   {
		
		   /* The package was not a ArtNet-package */
		   continue;
	   }
	   
	   
	    if (dmx->opcode != OP_OUTPUT) {
			/* DEBUG */
			printf("Received the OP Code %x\n", dmx->opcode);
			continue;
		}
	   
	   if (dmx->universe != 0) {
			printf("The Universe was %x\n", dmx->universe);
		   continue;
	   }
	   
	   unsigned short length =  dmx->lengthHi * 256 + dmx->length;

//	   printf("The Universe has the size of %d\n", length);
	   
	   /* Invalide Length was in package set */
	   if (length > MAX_DMX_SIZE)
		   length = 0;
	  
	   /* The length of the channels in one universe must be limited, because the microcontroller could not work with a complete universe*/
	   if (length > maxChannel)
		length = maxChannel;
	 
	   unsigned char* byte = &(dmx->dataStart);
	   
	
	   /* Send start sequence */
           fprintf(gSerialOutput, "op");

	   /* Format : op<value of channel1><value of channel2><....> When the value is 'o' it must be escaped */
	   for (i=1; i<=length; i++, byte++) {
//		   printf("%3d ", *byte);
		   if ((*byte) == 'o') {
			fprintf(gSerialOutput, "o");
		   }
	   	   fprintf(gSerialOutput, "%c", *byte);
	   }
	   fflush(gSerialOutput);   
	   
   }
}

void ex_program(int sig) {
	/* Any signal is handeld as ctr+c and ends the application */ 
	printf("nooooooo we are dying \n", sig);
	if (gSerialOutput != NULL) /* Close the serial device */
		fclose(gSerialOutput);
	(void) signal(SIGINT, SIG_DFL);
	exit (EXIT_FAILURE);
}
