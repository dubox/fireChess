/**************
 * 
 * FLMdecode 用于解析从二维码扫描到的加密过的数独6宫数据
 * 本程序逻辑翻译自FLMSCAN4.C
 * 
 * 
 * 
 */


 
var _6GONG = 0x3630;
 
 
/*****
 * 分解数据结构自：
 * flmsA006MAPC7B61AA617B61AA617B61AA617BA4A49A7N519554042480238F53E50CE48E0E95ED45C142// 01.png & 01a.png
 * 
 */
function FLM6(str){
	
	this.flms	 = str.substr(0,4);
	this.subvers = str.substr(4,4);
	this.MAPC	 = str.substr(8,4);
	this.paint	 = str.substr(12);
	this.w 		= 0;
	this.h 		= 0;
	this.dict 		= str.substr(27,6);
	
	this.data = {};
	this.data.bytes = str.substr(33,(6*6+3*6*6)/8);
	
}




var dict1 = '0123456789ABCDEF',   dict2 = '';

function resetdict2( )
{
	dict2 = dict1+dict1;
}

function randdict( c )
{
	var x,y;
	var ret, i= c&7;
	ret = ( c&8 )!=0 ? 1 : 0;
	resetdict2();	// add for loop to find .flm in directory.
	//strncpy( dict2, dict2+i+1, sizeof(dict1) );
	
	dict2 = dict2.substr(i+1 , dict1.length) + dict2.substr(dict1.length);
	
	
	dict2 = dict2.split('');
	// mix the randdict.
	for ( i=0; i<dict1.length/4; i++ )
	{
		x = dict2[i];
		
		dict2[i] = dict2[(dict1.length/2)-i-1];
		dict2[(dict1.length/2)-i-1] = x;
		//
		y = dict2[i+(dict1.length/2)];
		dict2[i+(dict1.length/2)] = dict2[dict1.length-i-1];
		dict2[dict1.length-i-1] = y;
	}
	return ret;
}


function char2hex( c )
{
	if ( c.charCodeAt(0) >= '0'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0) ) return c.charCodeAt(0)-'0'.charCodeAt(0);
	else if ( c.charCodeAt(0) >= 'A'.charCodeAt(0) && c.charCodeAt(0) <= 'F'.charCodeAt(0) ) return c.charCodeAt(0)-'A'.charCodeAt(0)+0xA;
	return c;
}

function str2hex(  s ){
	var buf;
	//buf = s.substr(1,1).charCodeAt(0).toString(2) + s.substr(0,1).charCodeAt(0).toString(2) + '0'.charCodeAt(0).toString(2);console.log(  s.substr(0,2) );
	buf = s.substr(0,2);
	//buf += 0;
	//sscanf( buf, "%X", &ret );
	return buf;
}

function dictfind(  c )
{
	
	for ( var i=0; i<dict1.length; i++ )
		if ( dict2[i] == c ) return dict1[i];
	return c;
}


/********
 * 
 * 
 * 
 * 
*/

//var  f = 'flms A006 MAPC 7B61AA617B61A A 6 17B61A A617BA4A49A7N51955 404248 0238F53E50CE48E0E95ED45C142// 01.png & 01a.png';
//var  f = 'flmsA006MAPC7B61AA617B61AA617B61AA617BA4A49A7N519554042480238F53E50CE48E0E95ED45C142// 01.png & 01a.png';
//var  f = 'flmsC006MAPC9D83CC839D83CC839D83CC839DC6C6BC9N73C5920CC70E06F220462B75632779AF18892F// 15.png & 15a.png';
//unpackflm( f )
function unpackflm( flmbuf )
{
	
	
	var flm6 =
	{
			'flms'		:	"flms",
			'subvers'	:[0,0,0,0],
			"MAPC"		:"MAPC",
			'paint'		:[0x3F,0x49,0,0x49,0x3F,0x49,0,0x49,0x3F,0x49,0,0x49,0x3F],
			'w':'6','h':'6',
			dict:"103N59",
			data:{bytes:[],bits:{}},
			flag:[],
			answer:[]
	};
	
	
	var c;
	var pflm = new FLM6(flmbuf);
	var i, r=randdict( char2hex (pflm.subvers[0]) );

	if ( r==0 ) return false;
	// check buffer.
	if (  pflm.flms !== flm6.flms )
		{console.log( "err1" );return false;}
	if ( pflm.subvers.substr(2) != '06' )
		{console.log( "err2" );return false;}
	if ( pflm.MAPC !== flm6.MAPC )
	{console.log( "err3" );return false;}



 pflm.paint = pflm.paint.split('');
	// mix the buffer.
	var i = 0;
	do {
		c = pflm.paint[i];//
		pflm.paint[i] = dictfind( c );
		
		i++;
	} while ( c !== 0 && c != '/' );
	
	var paint = pflm.paint.join('');

	// set the rand flag.
	pflm.subvers[0] = '0';

	// debug info.
//	printf( "%s\n", flmbuf );
//	disable by create flamedoku.
	
	for ( var i=0; i< flm6.paint.length + flm6.w.length + flm6.h.length; i++ )
	{
		pflm.paint[i] = str2hex( paint.substr(i*2) );
		
	}
	
	
	pflm.dict = pflm.paint.slice( i*2, i*2 + flm6.dict.length ).join('');

	if ( flm6.dict !=  pflm.dict){
		console.log( "err4" )
		return false;
	}

	r = i*2+flm6.dict.length;
	
	
	for ( i=0; i< pflm.data.bytes.length; i++ )
	{
		flm6.data.bytes[i] = str2hex(pflm.paint.slice( r+i*2 ).join('') );
	}/**/
	
	//console.log(flm6.data.bytes)
	//flm6.data.bytes = flm6.data.bytes.split('');
	var  bytes2 = '';
	for(var i = 0;i< flm6.data.bytes.length;i++){
		
		var  b = parseInt(flm6.data.bytes[i],16).toString(2);
		var l = 8-b.length;
		for(var j=1; j<=l;j++){
			b = '0' + b;
		
		
		}
		//
		bytes2 = b + bytes2;
	}
	

	
	var  j = 0,m=1;
	var  k = ['a','b','c','d','e','f'];

	var asc_0 = '0'.charCodeAt(0);
	var _flag = [];
	for(var i = 0; i<42;i++){
		if(i < 6){
		flm6.data.bits['m'+(i+1)] = bytes2.substr(-6);
		bytes2 = bytes2.substr(0,bytes2.length-6);	
			
			//题面
			var bytes_m = flm6.data.bits['m'+(i+1)];
			_flag = _flag.concat(bytes_m.split(''));
		
		}
		if(j>5){j =0;m++;}
		if(i > 5){
			//console.log(bytes2.substr(-3))
			flm6.data.bits[k[j]+m] = bytes2.substr(-3);
			
			if(typeof flm6.answer[m-1] == 'undefined')flm6.answer[m-1] = [];
			flm6.answer[m-1][j] = parseInt(flm6.data.bits[k[j]+m],2) + asc_0;
			
			j ++;
			bytes2 = bytes2.substr(0,bytes2.length-3);	
		}
		//console.log(bytes2.length)
	}
	//答案
	var q_n = [50,49,51,53,54,52] , _answer = [];
	for(var i in flm6.answer){
		
		for(var j in flm6.answer[i]){
			for(var n in q_n){
				if(flm6.answer[i][j] == q_n[n])
				{_answer.push(parseInt(n)+1); break;}
				
			}
		}
	}
	
	//var a = 0x20;
	//console.log(_flag)	//题面
	//console.log(_answer)	//答案
	
	return {'answer':_answer,'flag':_flag};
	
}






/****************************以下为 borland C FLMSCAN4.C源码


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dir.h>

#define FLMBUF 2000
#define _6GONG 0x3630

char flmbuf[FLMBUF];

struct FLM6
{
	char flms[4];
	unsigned char subvers[4];
	char MAPC[4];
	unsigned char paint[13];
	char w, h;
	char dict[6];
	union {
		unsigned char bytes[(6*6+3*6*6)/8];
		struct {
			unsigned char m1:6,
				      m2:6,
				      m3:6,
				      m4:6,
				      m5:6,
				      m6:6;
			unsigned char a1:3,b1:3,c1:3,d1:3,e1:3,f1:3,
				      a2:3,b2:3,c2:3,d2:3,e2:3,f2:3,
				      a3:3,b3:3,c3:3,d3:3,e3:3,f3:3,
				      a4:3,b4:3,c4:3,d4:3,e4:3,f4:3,
				      a5:3,b5:3,c5:3,d5:3,e5:3,f5:3,
				      a6:3,b6:3,c6:3,d6:3,e6:3,f6:3;
		} bits;
	} data;
	char flag[6][7];
	char answer[6][7];
} flm6 =
{
	"flms",
	0,0,0,0,
	"MAPC",
	0x3F,0x49,0,0x49,0x3F,0x49,0,0x49,0x3F,0x49,0,0x49,0x3F,
	6,6,
	"103N59",
};

char *screen[6*4+1] =
{
	"++===+===+===++===+===+===++",
	"||   |   |   ||   |   |   ||",
	"|| 1 | 0 | 0 || 0 | 0 | 0 ||",
	"||   |   |   ||   |   |   ||",
	"++---+---+---++---+---+---++",
	"||   |   |   ||   |   |   ||",
	"|| 2 | 0 | 0 || 0 | 0 | 0 ||",
	"||   |   |   ||   |   |   ||",
	"++===+===+===++===+===+===++",
	"||   |   |   ||   |   |   ||",
	"|| 3 | 0 | 0 || 0 | 0 | 0 ||",
	"||   |   |   ||   |   |   ||",
	"++---+---+---++---+---+---++",
	"||   |   |   ||   |   |   ||",
	"|| 4 | 0 | 0 || 0 | 0 | 0 ||",
	"||   |   |   ||   |   |   ||",
	"++===+===+===++===+===+===++",
	"||   |   |   ||   |   |   ||",
	"|| 5 | 0 | 0 || 0 | 0 | 0 ||",
	"||   |   |   ||   |   |   ||",
	"++---+---+---++---+---+---++",
	"||   |   |   ||   |   |   ||",
	"|| 6 | 0 | 0 || 0 | 0 | 0 ||",
	"||   |   |   ||   |   |   ||",
	"++===+===+===++===+===+===++",
};

char* screenxy( char x, char y )
{
	char *p;
	if ( x >= 'a' && x <= 'f' &&
	     y >= '1' && y <= '6' )
	{
		x -= 'a';
		y -= '1';
		p =  screen[2+y*4];
		p += 4+4*x-1;
		if ( x >= 3 ) p++;
		return p;
	}
	return NULL;
}

void paintflm6( void )
{
	int i,x,y;
	char* p, ln[6*4+1][80];
	// erase the screen.
	for ( y='1'; y<='6'; y++ )
	for ( x='a'; x<='f'; x++ )
		if ( ( p = screenxy( x, y ) ) != NULL )
			*p = ' ';
	// paint flag.
	for ( y='1'; y<='6'; y++ )
	for ( x='a'; x<='f'; x++ )
		if ( ( p = screenxy( x, y ) ) != NULL )
		if ( flm6.flag[y-'1'][x-'a'] == '1' )
			*p = flm6.answer[y-'1'][x-'a'];
	for ( y=0; y<6*4+1; y++ )
		sprintf( ln[y], "%s\t", screen[y] );
	// paint answer.
	for ( y='1'; y<='6'; y++ )
	for ( x='a'; x<='f'; x++ )
		if ( ( p = screenxy( x, y ) ) != NULL )
			*p = flm6.answer[y-'1'][x-'a'];
	for ( y=0; y<6*4+1; y++ )
	{
		// replace the paint char.
		for ( i=0; i<strlen(ln[y]); i++ )
		if ( ln[y][i] >= '1' && ln[y][i] <= '6' )
		{
			ln[y][i] -= '1';
			ln[y][i] = flm6.dict[ln[y][i]];
		}
		for ( i=0; i<strlen(screen[y]); i++ )
		if ( screen[y][i] >= '1' && screen[y][i] <= '6' )
		{
			screen[y][i] -= '1';
			screen[y][i] = flm6.dict[screen[y][i]];
		}

		//disable by create flamedoku.
                if ( (y&1) == 0 )
		// print the result.
		printf( "\t%s%s\n", ln[y], screen[y] );
        }
}

char dict1[16] = "0123456789ABCDEF",
     dict2[32];

void resetdict2( void )
{
	strncpy( dict2, dict1, sizeof(dict1) );
	strncpy( dict2+sizeof(dict1), dict1, sizeof(dict1) );
}

int randdict( int c )
{
	char x,y;
	int ret, i= c&7;
	ret = ( c&8 )!=0 ? 1 : 0;
	resetdict2();	// add for loop to find .flm in directory.
	strncpy( dict2, dict2+i+1, sizeof(dict1) );
	// mix the randdict.
	for ( i=0; i<sizeof(dict1)/4; i++ )
	{
		x = dict2[i];
		dict2[i] = dict2[(sizeof(dict1)/2)-i-1];
		dict2[(sizeof(dict1)/2)-i-1] = x;
		//
		y = dict2[i+(sizeof(dict1)/2)];
		dict2[i+(sizeof(dict1)/2)] = dict2[sizeof(dict1)-i-1];
		dict2[sizeof(dict1)-i-1] = y;
	}
	return ret;
}

char dictfind( char c )
{
	int i;
	for ( i=0; i<sizeof(dict1); i++ )
		if ( dict2[i] == c ) return dict1[i];
	return c;
}

void unpackerr( char* msg )
{
	printf( "can't unpack the buffer, it's not the .flm stream. err#: %s", msg );
	exit(1);
}

unsigned char char2hex( char c )
{
	if ( c >= '0' && c <= '9' ) return c-'0';
	else if ( c >= 'A' && c <= 'F' ) return c-'A'+0xA;
	return (unsigned char)c;
}

unsigned char str2hex( char* s )
{                          
	char buf[3], ret;     //
	((short*)buf)[0] = ((short*)s)[0];
	buf[2] = 0;    //printf( "%s \n",buf);
	sscanf( buf, "%X", &ret );
	return ret;
}

void unpackflm( void )
{
	char c;
	struct FLM6 *pflm = (struct FLM6*)flmbuf;
	int i, r=randdict( char2hex (pflm->subvers[0]) );



	if ( r==0 ) return;
	// check buffer.
	if ( strncmp( pflm->flms, flm6.flms, sizeof(flm6.flms) ) !=0 )
		unpackerr( "1" );
	if ( *(short*)(pflm->subvers+2) != _6GONG )
		unpackerr( "2" );
	if ( strncmp( pflm->MAPC, flm6.MAPC, sizeof(flm6.MAPC) ) !=0 )
		unpackerr( "3" );
			 
	// mix the buffer.
	i = 0;
	do {
		c = pflm->paint[i];
		pflm->paint[i] = dictfind( c );
		i++;
	} while ( c != 0 && c != '/' );
		 
	// set the rand flag.
	pflm->subvers[0] = '0';

	// debug info.
//	printf( "%s\n", flmbuf );
//disable by create flamedoku.

	for ( i=0; i<sizeof(flm6.paint) + sizeof(flm6.w) + sizeof(flm6.h); i++ )
	{             //
		pflm->paint[i] = str2hex( pflm->paint+i*2 );
			  
	}

	

	strncpy( pflm->dict, pflm->paint+i*2, sizeof(flm6.dict) );

	
		      //printf( "%s ",pflm->paint+i*2);
	if ( strncmp( pflm->paint, flm6.paint, sizeof(flm6.paint)
		+ sizeof(flm6.w) + sizeof(flm6.h) + sizeof(flm6.dict) ) != 0 )
		unpackerr( "4" );

	r = i*2+sizeof(flm6.dict);

	


	for ( i=0; i<sizeof(flm6.data.bytes); i++ )
	{
		
		flm6.data.bytes[i] = str2hex( pflm->paint+r+i*2 );
		//printf( "%x \n",flm6.data.bytes[i]);
	}
		    
}

void transflm6( void )
{
	int i,x,y;
	// add for replace the flamedoku char.
	char tmps[7];

	// data.bits.m1
	i = flm6.data.bits.m1;
	for ( x=0; x<sizeof(flm6.dict); x++ )
	{	flm6.flag[0][x] = ( (i&0x20) != 0 ) ? '1' : '0';
		i <<= 1;	}
	// data.bits.m2
	i = flm6.data.bits.m2;
	for ( x=0; x<sizeof(flm6.dict); x++ )
	{	flm6.flag[1][x] = ( (i&0x20) != 0 ) ? '1' : '0';
		i <<= 1;	}
	// data.bits.m3
	i = flm6.data.bits.m3;
	for ( x=0; x<sizeof(flm6.dict); x++ )
	{	flm6.flag[2][x] = ( (i&0x20) != 0 ) ? '1' : '0';
		i <<= 1;	}
	// data.bits.m4
	i = flm6.data.bits.m4;
	for ( x=0; x<sizeof(flm6.dict); x++ )
	{	flm6.flag[3][x] = ( (i&0x20) != 0 ) ? '1' : '0';
		i <<= 1;	}
	// data.bits.m5
	i = flm6.data.bits.m5;
	for ( x=0; x<sizeof(flm6.dict); x++ )
	{	flm6.flag[4][x] = ( (i&0x20) != 0 ) ? '1' : '0';
		i <<= 1;	}
	// data.bits.m6
	i = flm6.data.bits.m6;
	for ( x=0; x<sizeof(flm6.dict); x++ )
	{	flm6.flag[5][x] = ( (i&0x20) != 0 ) ? '1' : '0';
		i <<= 1;	}
				//printf( "%s \n",flm6.flag[5][2]);

	// unsigned char a1:3,b1:3,c1:3,d1:3,e1:3,f1:3,
	flm6.answer[0][0] = flm6.data.bits.a1+'0';     //printf( "%x \n",flm6.answer[0][0]);
	flm6.answer[0][1] = flm6.data.bits.b1+'0';
	flm6.answer[0][2] = flm6.data.bits.c1+'0';
	flm6.answer[0][3] = flm6.data.bits.d1+'0';
	flm6.answer[0][4] = flm6.data.bits.e1+'0';
	flm6.answer[0][5] = flm6.data.bits.f1+'0';

	// a2:3,b2:3,c2:3,d2:3,e2:3,f2:3,
	flm6.answer[1][0] = flm6.data.bits.a2+'0';
	flm6.answer[1][1] = flm6.data.bits.b2+'0';
	flm6.answer[1][2] = flm6.data.bits.c2+'0';
	flm6.answer[1][3] = flm6.data.bits.d2+'0';
	flm6.answer[1][4] = flm6.data.bits.e2+'0';
	flm6.answer[1][5] = flm6.data.bits.f2+'0';

	// a3:3,b3:3,c3:3,d3:3,e3:3,f3:3,
	flm6.answer[2][0] = flm6.data.bits.a3+'0';
	flm6.answer[2][1] = flm6.data.bits.b3+'0';
	flm6.answer[2][2] = flm6.data.bits.c3+'0';
	flm6.answer[2][3] = flm6.data.bits.d3+'0';
	flm6.answer[2][4] = flm6.data.bits.e3+'0';
	flm6.answer[2][5] = flm6.data.bits.f3+'0';

	// a4:3,b4:3,c4:3,d4:3,e4:3,f4:3,
	flm6.answer[3][0] = flm6.data.bits.a4+'0';
	flm6.answer[3][1] = flm6.data.bits.b4+'0';
	flm6.answer[3][2] = flm6.data.bits.c4+'0';
	flm6.answer[3][3] = flm6.data.bits.d4+'0';
	flm6.answer[3][4] = flm6.data.bits.e4+'0';
	flm6.answer[3][5] = flm6.data.bits.f4+'0';

	// a5:3,b5:3,c5:3,d5:3,e5:3,f5:3,
	flm6.answer[4][0] = flm6.data.bits.a5+'0';
	flm6.answer[4][1] = flm6.data.bits.b5+'0';
	flm6.answer[4][2] = flm6.data.bits.c5+'0';
	flm6.answer[4][3] = flm6.data.bits.d5+'0';
	flm6.answer[4][4] = flm6.data.bits.e5+'0';
	flm6.answer[4][5] = flm6.data.bits.f5+'0';

	// a6:3,b6:3,c6:3,d6:3,e6:3,f6:3;
	flm6.answer[5][0] = flm6.data.bits.a6+'0';
	flm6.answer[5][1] = flm6.data.bits.b6+'0';
	flm6.answer[5][2] = flm6.data.bits.c6+'0';
	flm6.answer[5][3] = flm6.data.bits.d6+'0';
	flm6.answer[5][4] = flm6.data.bits.e6+'0';
	flm6.answer[5][5] = flm6.data.bits.f6+'0';

	// sprintf all.
	for ( y=0; y<6; y++ )
	{
        	// add for create flamedoku.
		strcpy( tmps, flm6.flag[y] );   printf( "%s\n", tmps );
		// replace the paint char.
		for ( i=0; i<strlen(tmps); i++ )
		if ( tmps[i] >= '1' && tmps[i] <= '6' )
		{
			tmps[i] -= '1';
			tmps[i] = flm6.dict[tmps[i]];
		}
		//printf( "%s\n", tmps );
//disable by create flamedoku.
	}
	for ( y=0; y<6; y++ )
	{
		// add for create flamedoku.
		strcpy( tmps, flm6.answer[y] );
		// replace the paint char.
		for ( i=0; i<strlen(tmps); i++ )
		if ( tmps[i] >= '1' && tmps[i] <= '6' )
		{
			tmps[i] -= '1';
			tmps[i] = flm6.dict[tmps[i]];
		}
		printf( "%s\n", tmps );
//disable by create flamedoku.
	}
}

void main( int argc, char* argv[] )
{
	FILE *f;
	long i, len;
	struct FLM6 *pf;


	// read file in memory.
	f = fopen( "C:\\BC\\FLMRD\\alldone.flm", "rt" );
	if ( f == NULL )
	{
		printf("the file '%s' open error.","C:\BC\FLMRD\alldone.flm");
		exit(1);
	}

	pf = (struct FLM6*)flmbuf;
	// loop to get 1line.
	while ( !feof(f) )
	{ //---------------

		// clear buffer.
		for ( i=0; i<FLMBUF; i++ )
			flmbuf[i] = 0;

		if ( fgets( flmbuf, FLMBUF, f ) == NULL )
			break;
		len = strlen(flmbuf);

		if ( strnicmp( pf->flms, flm6.flms, sizeof(flm6.flms) ) == 0 )
		{
			// report the file.
			for ( i=0; i<len; i++ )
	//			printf("%c", flmbuf[i]);
	//disable by create flamedoku.
				if ( flmbuf[i] == '/' ) break;
		      //	printf( "\n%s",flmbuf+i );

			// do the unpack.
			if ( ( char2hex(pf->subvers[0]) & 0x8 ) != 0 )
				unpackflm();
			// tranlate to sudoku array.
			transflm6();
			// paint the sudoku.
			paintflm6();
		}
	};
	fclose(f);
}



*******************************/










 