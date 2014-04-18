
function validFloat(num,emptyOk)
{
    try
    {	
        var s = '';
        s += num;
        s = s.replace(/[^\d.]/g, '');  
	    if(s == ''){ 
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
    	console.log('Error parsing num: '+ e['message'])
    	return [false, ' could not be evaluated. Invalid value:<em> '+num+' </em> entered. '];    	
    }
   	
}


function formatMoney(number)
{
 	if (isNaN(number) || number == null) return '';
  var newNum = parseFloat(Math.round(number * 100) / 100).toFixed(2);
  var tsep = ',';
  var parts = (''+newNum).split('.');
  var fnums = parts[0];
  var decimals = parts[1] ? '.' + parts[1] : '';

  return '$'+ fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
}

function countMe(val,lbl,owner,which)
{
    $('#'+owner+lbl+'_'+which).val(formatMoney(val));
    console.log('#'+owner+lbl+'_'+which +'   '+formatMoney(val));
}




function parseBday(newVal,me)
    {
        var newAge;
        var formatDate; 
        if(newVal.length == 0)
         {
            return [false,'Birthday or age is required to continue. This field cannot be left blank']
         }   
        else if(newVal.length <= 2)
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



function isDefined(what,where)
{
	try{
    		if(what !== undefined){return true;}    		
  		}
  	catch(e)
  		{
    		return false;
    		console.log(where + ' sent an undefined')
  		}
}


function isChecked(name){return $('[name="'+name+'"]').is(":checked");}	
function showError(where,msg)
{
	$('.errorMSG').html('');
	$('#err'+where).html(msg);
}

function minmaxCheck(product,val)
{
    return true;
}
function checkInputVal(ent,req,where)
{
	var ans = $(ent).val(); 
	if(( ans !== undefined)&&(ans != '')){ $(ent).removeClass('errorClass'); return true;}
	if(req)
	{
		$(ent).addClass('errorClass');
		showError(where,'Required Fields Missing');		
	}
	return false;
}


function policyGlobagffgg()
{
	this.hasChild = false;
	this.hasSpouse = false;
	this.hourUsed = 30;
	this.perWeek = function()
	{
		return this.hourUsed * 40;
	}
	this.perYear = function()
	{
		return this.hourUsed * 40 * 52;
	}
}

function minMaxCheck(product,newCOV)
	{
		if(newCOV < defArr[product].minFace)
		{
			return [false,'This change cannot be made. The minimum Coverage for ' + product + ' is $' + defArr[product].minFace];
		}
		else if(newCOV > defArr[product].maxFace)
		{			
			return [false,'This change cannot be made. The maximum Coverage for ' + product + ' is $' + defArr[product].maxFace];	
		}
		return [true];
	}


function setA71()
{
	this.lbl = 'A71'
	this.singleOnly=false;
	this.individualOnly=false;
	this.policyType = 2;  ///single, double. triple
	this.familyType = 'F'; /// family, individual, none
	this.MBD = 0;
	this.weekly = 0;
	this.annual = 0;
	this.policySet = true;
	this.familySet = true;
	this.maxAge= 74;
	this.added = true;
}

