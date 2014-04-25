/*
    params: number,boolean
     if num val empty or undefined? if empty ok?[true,0]:[false,error msg]
     strips all non-numeric vals then formats value to $0,000,000.00
*/
function validFloat(num,emptyOk)
{
    try
    {	
        var s = '';
        s += num; 
        s = s.replace(/[^\d.]/g, '');       
	    if((s == '')||(!isDefined(num,-1))){ 
            if(emptyOk){ return [true,0,0]}
            else{
                 return [false,' is required to continue. This field cannot be left blank'];
                }  
        }

		var newNum = parseFloat(s);	
		if(!isNaN(newNum))
		{
			return [true,newNum]
		}
		else{

			return [false, ' could not be evaluated. Invalid value:<em> '+num+' </em> entered. '];   
			}

			
    }
    catch(e)
    {
    	//console.log('Error parsing num: '+ e['message'])
    	return [false, ' could not be evaluated. Invalid value:<em> '+num+' </em> entered. '];    	
    }   	
}

/*
    params: number
     returns empty string (to show placeholder) if invalid, null, or undefined
     formats value to $0,000,000.00
*/
function formatMoney(number)
{
  if ((number == null) || (!isDefined(number,'format money ')) || (isNaN(number))){ return ''; };
  var newNum = parseFloat(Math.round(number * 100) / 100).toFixed(2);
  var tsep = ',';
  var parts = (''+newNum).split('.');
  var fnums = parts[0];
  var decimals = parts[1] ? '.' + parts[1] : '';

  return '$'+ fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
}

/*
    params: Birthday/Age val, ownerID(spouse or policy holder)
     if Birthday/Age val is empty? [false,error message]
     if val.length <= 3 (scenario: 101 year old with a lot of plastic surgery)
        treats val as age and checks if valid int, checks if within range?[true,age],[false,error message]
     if val.lenght > 3, checks if valid date, checks if within age range?[true,age,properly formatted birthday],[false,error message]
*/
function parseBday(newVal,me)
    {
        var newAge;
        var formatDate; 
        if(newVal.length == 0)
         {
            return [false,'Birthday or age is required to continue. This field cannot be left blank']
         }   
        else if(newVal.length <= 3)
        { 
        	var checkNum = new RegExp(/^\d+$/i);
			var isInt = checkNum.test(newVal);
            if(!isInt){ 
            	return [false,'Invalid value:<em> '+newVal+' </em> entered as Age.']
            }
            	
            newAge = parseInt(newVal);
            formatDate = newVal;
        }
        else
        {
            try 
            {
            	var phBirthday = new Date(Date.parse(newVal));
                var ageDifMs = Date.now() - phBirthday;
                var mAge = Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
                newAge = parseInt(mAge);
                formatDate = (phBirthday.getMonth() + 1) + "/" + phBirthday.getDate() + "/" + phBirthday.getFullYear();
                if(isNaN(newAge)){                	
                	return [false,'Invalid value:<em> '+newVal+' </em> entered as Birthday.']
                }
            }
            catch(e)
            {
                return [false,'Invalid value:<em> '+newVal+' </em> entered as Birthday.']
            }
            
        }
        if((newAge < 18)||(newAge > 80))
        {
            return [false,'There are currently no available policies for applicants <em>' + newAge + '</em> years of age.']; 
        }
       
        return [true,newAge,formatDate]; 
    }


/*
    params - value, sent from info
        checks if value is defined- returns true
        if not, if where - console.log back where undefined occured
*/
function isDefined(val,source)
{
	try{
    		if(jQuery.type(val)==="undefined")
                {
                     if(source != -1)
                        {
                            console.log(source + ': undefined value');
                        }                       
                     return false; 
                } 
            else
            {
                return true;
            }
  		}
  	catch(e)
  		{    		
    		console.log(source + ' threw an error: ' + e.message);
            return false;
  		}
}


/*
    params - string,number
        Check if valid float and if within maximum and minimum allowable values for product
        returns 'false,error message' if false
        returns 'true,valid value' if true
*/
function minMaxCheck(product,COV)
	{
        var newCOV = validFloat(COV,false);
        if(newCOV[0])
            {
    		if(newCOV[1] < defArr[product].minFace)
    		{
    			return [false,'This change cannot be made. The minimum coverage for ' + product + ' is $' + defArr[product].minFace];
    		}
    		else if(newCOV[1] > defArr[product].maxFace)
    		{			
    			return [false,'This change cannot be made. The maximum coverage for ' + product + ' is $' + defArr[product].maxFace];	
    		}
        }
		return newCOV;
	}



function policyAppWarning(msg)
{
    return true;
}

function policyAppMinorError(msg)
{
    return true;
}

function policyAppTerminalError(msg)
{
    return true;
}


/*
    params: product element, product id, value
        function to initialize new countUp fxn
        uses last valid value from error array then updates error array lastValid to new Value;
*/
function countMe(which,owner,val)
{
    if(isNaN(val)){return;}
    var myId = owner+'_'+which;
    console.log(''+myId+ "  " +pmE.errArray[myId].lastValid() + "   "+val)
    var countDiff = new countUp(myId,pmE.errArray[myId].lastValid(),val,2,0.8);
    countDiff.start();
    pmE.removeError(which,owner,val);
}

/*   
 countUp.js  v1.1.0 
    by @inorganik 
    slightly modified - removed unused options and unneccessary functions
                      - uses jQuery.val() function rather than target.innerHTML
                      - adds dollar sign to returned string
*/
function countUp(target, startVal, endVal, decimals, duration) {
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'ms'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        }
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        }
    }

    var self = this;
    this.id='#'+target;
    this.d = (typeof target === 'string') ? document.getElementById(target) : target;
    this.startVal = Number(startVal);
    this.endVal = Number(endVal);
    this.countDown = (this.startVal > this.endVal) ? true : false;
    this.startTime = null;
    this.timestamp = null;
    this.remaining = null;
    this.frameVal = this.startVal;
    this.rAF = null;
    this.decimals = Math.max(0, decimals || 0);
    this.dec = Math.pow(10, this.decimals);
    this.duration = duration * 1000 || 2000;
    
    this.easeOutExpo = function(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    }

    this.count = function(timestamp) {
        
        if (self.startTime === null) self.startTime = timestamp;

        self.timestamp = timestamp;

        var progress = timestamp - self.startTime;
        self.remaining = self.duration - progress;
        
         if (self.countDown) {
                var i = self.easeOutExpo(progress, 0, self.startVal - self.endVal, self.duration);
                self.frameVal = self.startVal - i;
            } else {
                self.frameVal = self.easeOutExpo(progress, self.startVal, self.endVal - self.startVal, self.duration);
            }
               
        self.frameVal = Math.round(self.frameVal*self.dec)/self.dec;
        if (self.countDown) {
            self.frameVal = (self.frameVal < self.endVal) ? self.endVal : self.frameVal;

        } else {
            self.frameVal = (self.frameVal > self.endVal) ? self.endVal : self.frameVal;
        }
        $(self.id).val(self.formatNumber(self.frameVal.toFixed(self.decimals)));
        if (progress < self.duration) {
            self.rAF = requestAnimationFrame(self.count);
        } 
    }  
    this.start = function(){
        self.rAF = requestAnimationFrame(self.count);            
        return false;
    }

    this.formatNumber = function(nStr) {
        nStr += '';
        var x, x1, x2, rgx;
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return '$'+x1 + x2;
    }
    $(self.id).val(self.formatNumber(self.startVal.toFixed(self.decimals)));
}