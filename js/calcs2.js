
$.fn.hourpowerCalcs = function(){

var A71 = new setA71();
var pSpouse = new policyHolder();
pSpouse.pId='SPS';
pSpouse.ps.SPR = new product('SPR',true);
pSpouse.ps.SPR.added = false;

var pHolder = new policyHolder();  
pHolder.ps.CHR = new product('CHR',true);
pHolder.ps.CHR.added = false;
pHolder.ps.CHR.MBD = defArr.CHR.MBD;

var ALP = new product('ALP', false);
var AHP = new product('AHP', false);
var totals = new product('TTL', false);
var tempPH = new policyHolder();
tempPH.ps.CHR = new product('CHR',true);
tempPH.ps.SPR = new product('SPR',true);
tempPH.added= true;
tempPH.allowed = true;
tempPH.pId = -1;

var policy = new policyGlobal();

function eventHandlers_Products()
{

	$("input[name='A71_Radio']:radio").change(function(){
			A71.policyType = $("input[name='A71_Radio']:checked").val();
			calculateA71();}
			);
	$('#A71_Select').change(function(){

		A71.familyType = $('#A71_Select').val(); 
		calculateA71();});

	$('.pgSELECT').change(function(){
		if ($(this).attr('id').indexOf('SPS') != -1){pSpouse.lastChanged = 'YRS'; calculateVals('TYR',pSpouse);}
		else{pHolder.lastChanged = 'YRS'; calculateVals('TYR',pHolder);}	

	$('#btnCalcPolicy').click(function(){setForm()});
	});


	$('.pgShow').change(function() {
	var addMe =false;
	var product = $(this).attr('id').replace('_SHW','');
	console.log(product);
     if($(this).is(":checked")) {addMe = true;}

     if ($(this).attr('id').indexOf('SPS') != -1)
     {     	
     	pSpouse.ps[product.replace('SPS','')].added = addMe;
     }
     else if($(this).attr('id').indexOf('A71') != -1)
     {
     	A71.added = addMe;
     }
     else{pHolder.added=addMe;}
     	console.log('add product:' + addMe);
     	toggleAddRemove(product,addMe);
     	updatePowerHowerTotals();
		});	

		$('.pgInputs').focusout(function(){		
		var which = $(this).attr('id').split("_");
		var newVal = parseFloat($(this).val().replace('$',''));
		
		if (which[0].indexOf('SPS') != -1)
		{			
			var newP = which[0].replace('SPS','');
			changeProductValues(pSpouse,newP,newVal,which[1],$(this).attr('id'));	
		}
		else
		{
			changeProductValues(pHolder,which[0],newVal,which[1],$(this).attr('id'));	
		}

	});
}


function cleanStart()
{		
		A71.singleOnly = false;
		A71.individualOnly = false;
		A71.allowed = true;
		for(var p in pHolder.ps)
		{
			pHolder.ps[p].allowed = true;
		}
		for(var p in pSpouse.ps)
		{
			pSpouse.ps[p].allowed = true;
		}

		policy.hasSpouse = false;
		policy.hasChild = false;	
}


function initEventHandlersForm1()
{
	$('#btnCalcPolicy').click(function(){setForm()});

	$('.addSpouse').focusout(function(){
	if(($('#psName').val() != 0) || ($('#psHourly').val() != 0))
	$('#spouseHour').show();
	pHolder.hasSpouse = true;
});
}


initEventHandlersForm1();
eventHandlers_Products();
function setForm()
{
	cleanStart();
	getInitVals();
	
	checkA71();
    populateForm();

}


function getInitVals()
{
	pHolder.fname = checkInputVal('#phName',false,1)?$('#phName').val():'POLICY HOLDER';
	pHolder.age = checkInputVal('#phAge',true,1)?$('#phAge').val():40;
	pHolder.hourly = checkInputVal('#phHourly',true,1)?cleanMoney($('#phHourly').val()):30;
	pHolder.sex = $('input:radio[name=phSex]:checked').val()?$('input:radio[name=phSex]:checked').val():'M';
	pHolder.smokes = isChecked('phSmokes')? 'TU':'NTU';
	policy.hasChild = isChecked('hasChild');
	console.log(pHolder.fname);

	$(".addSpouse:not('.button')").each(function()
	{
		if($(this).val() != '')
		{
			policy.hasSpouse = true;
			console.log('spouse exists');
		}
	});
		 checkAgeReqs(pHolder);
	
	////testing
	policy.hasSpouse = true;
	policy.hasChild = true;
	///////////


	if(policy.hasSpouse)
	{
		pSpouse.fname = checkInputVal('#psName',false,'1SPS')?$('#psName').val():'SPOUSE';
		pSpouse.age = checkInputVal('#psAge',true,'1SPS')?$('#psAge').val():40;
		pSpouse.hourly = checkInputVal('#psHourly',true,'1SPS')?cleanMoney($('#psHourly').val()):0;
		pSpouse.sex = $('input:radio[name=psSex]:checked').val()?$('input:radio[name=psSex]:checked').val():'M';
		pSpouse.smokes = isChecked('psSmokes')? 'TU':'NTU';
		checkAgeReqs(pSpouse);
	}
    


	switch($('input:radio[name=psSex]:checked').val())
	{
		case 1: 
			policy.hour = pHolder.hourly 
			break;
		case 2: 
			policy.hour= pHolder.hourly + pSpouse.hourly 
			break;
		case 3: 
		policy.hour = cleanMoney($('#customHour').val()) ;
		break;
		default:
		 policy.hour = 30.00;
	}

	policy.MBD = policy.hour * 4.33;
	policy.yearly = policy.MBD * 12;


//////For Testing
var ages = [17,18,28,40,50,54,56,57,59,60,61,65,70,81]
pHolder.age = ages[3];
pSpouse.age = ages[4];
}



function checkAgeReqs(ph)
{
	console.log('CHECK limits for age: ' + ph.age)
	if((ph.age<18) || (ph.age>80))
	{
		showError(1+ph.pId,'Applicant outside of coverd Age Range (18-80)');
		return;
	}


	if((policy.hasSpouse)&&(ph.pId == 'SPS'))
		{
			if(ph.age > defArr.SPR.maxAge)
			{
			  ph.ps.SPR.allowed = false;
			}
		}
	if(ph.age>defArr.TYR.maxAge)
	{
		TYR.allowed = false;
	}
	console.log('CHECK ADB')
	if(ph.age< defArr.ADB.ageRate[0])
	{
			ph.ps.ADB.MBD=defArr.ADB.rate[0];
			console.log('AGE <' + defArr.ADB.rate[0])
	}
	else if(ph.age< defArr.ADB.ageRate[1]){ph.ps.ADB.MBD=defArr.ADB.rate[1];
	console.log('AGE <' + defArr.ADB.rate[1])
	}
	else if(ph.age< defArr.ADB.ageRate[2]){ph.ps.ADB.MBD=defArr.ADB.rate[2];
    console.log('AGE <' + defArr.ADB.rate[2])
	}
	else{ 
			ph.ps.ADB.allowed = false;
			console.log('AGE >' + defArr.ADB.rate[2])
		}
		console.log('ADB' + ph.ps.ADB.MBD)

	if(ph.age>74){A71.allowed = false;}
	else if((ph.age>64)&&(ph.pId !='SPS'))
		{
			A71.singleOnly = true;			
		}
}





function checkA71()
	{ if(!A71.allowed){return;}

		if((!policy.hasSpouse)&&(!policy.hasChild))
		{
			A71.individualOnly=true;
			A71.familyType = 'I';
			$('#Family').hide();
		}
		else if(A71.familySet){ 
			A71.individualOnly=false;
			A71.familyType  = 'F';
			$('.Family').show();

			A71.familySet = false;
		}
		if(A71.singleOnly){
			A71.policyType = 1;
			$('.A7notSingle').hide();
		}
		else if(A71.policySet){ 			
			A71.policyType = 2;
			A71.policySet = false;
		}
		$('#A71_Select').val(A71.familyType); 
		$("input[name='A71_Radio'][value='"+A71.policyType+"']").prop('checked', true);
		calculateA71();
	}

function calculateA71()
{

	if(A71.familyType == 'I')
	{
		$('.A7_Name').html('Individual');
	}
	else
	{
		$('.A7_Name').html('Family');
	}

		A71.cFace = 200 * parseInt(A71.policyType);
		console.log('A71 MBD: ' + dataA71[A71.policyType][A71.familyType][pHolder.age][0]);
		A71.MBD = cleanMoney(dataA71[A71.policyType][A71.familyType][pHolder.age][0]);
		A71.annual = cleanMoney(dataA71[A71.policyType][A71.familyType][pHolder.age][1]);
		A71.weekly = cleanMoney(A71.annual/52);



		$('#A71_COV').val(A71.cFace);
		$('#A71_MBD').val(A71.MBD);
		$('#A71_ANN').val(A71.annual);
		$('#A71_WKL').val(A71.weekly);

}

function removeProduct(className)
{
	if(className.indexOf("SPS") != -1)
	{
		pSpouse.ps[className].added = false;
	}
	else
	{
		pHolder.ps[className.replace('SPS','')].added = false;
	}
	toggleAddRemove(className,false);
}

function toggleAddRemove(className,added)
{	
	var which = (className.indexOf("A71") != -1)?'.A71inputs':'.pgInputs'
	if(!added)
	{
		console.log('turn off '+className + ' ' + added);
		$('.'+className+' '+which).css({'opacity':0.4});
		$('.'+className+' '+which).prop("readonly",true);
		$('#'+className+'_SHW').prop('checked', false);
	}
	else
	{
		console.log('turn off '+className + ' ' + added);
		$('.'+className+' '+which).css({'opacity':1});
		$('.'+className+' '+which).prop("readonly",false);
		$('#'+className+'_SHW').prop('checked', true);
	}
}


function populateForm()
{
	if(A71.allowed){$('.A71').show();}else{$('.A71').hide();}
	toggleAddRemove('A71', A71.added);
		for(var p in pHolder.ps)
		{
			if(pHolder.ps[p].allowed){$('.'+pHolder.ps[p].lbl).show();}
			else {$('.'+p).hide();}
			toggleAddRemove(p+pHolder.pId,pHolder.ps[p].added);
		}
		for(var p in pSpouse.ps)
		{
			if(pSpouse.ps[p].allowed){$('.'+pSpouse.ps[p].lbl).show();}
			else{$('.'+p).hide();}
			toggleAddRemove(p+pSpouse.pId,pSpouse.ps[p].added)
		}

	if(policy.hasSpouse){$('.SPS').show();}else{$('.SPS').hide();}
	if(policy.hasChild){$('.CHR').show();}else{$('.CHR').hide();}
	$('.name_pHolder').html(pHolder.fname);
	$('.name_pSpouse').html(pSpouse.fname);	

	for(var p in pHolder.ps)
		{
			calculateVals(p,pHolder);		
		}
		for(var p in pSpouse.ps)
		{
			calculateVals(p,pSpouse);
		}
	updatePowerHowerTotals();

}

function calculateVals(product,pg)
{ 	
		if(!pg.ps[product].allowed){return;}		
		pg.getMBD(product);
		pg.setRate(product);
		var TYR = 1;


		if(product=='TYR')
			{ TYR = $('#'+product+pg.pId+'_YRS').val() }
			console.log('updating TYR to: ' + TYR);
	switch(pg.ps[product].lastChanged)
	{
		case 'COV': 
			
			pg.ps[product].MBD = (cleanMoney((pg.ps[product].rate * pg.ps[product].cFace)/12))*TYR;
			pg.ps[product].yearly = (cleanMoney(pg.ps[product].MBD * 12 ))*TYR;
			pg.ps[product].weekly = (cleanMoney(pg.ps[product].MBD / 4.33))*TYR;		
		break;
		case 'WKL': 
		policy.powerHour = pHolder.hourly 
		break;
		case 'ANN': 
		policy.powerHour = pHolder.hourly 
		break;
		case 'YRS':
			pg.ps[product].MBD = (cleanMoney((pg.ps[product].rate * pg.ps[product].cFace)/12))*TYR;
			pg.ps[product].yearly = (cleanMoney(pg.ps[product].MBD * 12 ))*TYR;
			pg.ps[product].weekly = (cleanMoney(pg.ps[product].MBD / 4.33))*TYR;	
		break;
	}
	if(pg.pId != -1)
	{
			updateProduct(pg,product,'WKL',pg.ps[product].weekly);	
			updateProduct(pg,product,'COV',pg.ps[product].cFace);	
			updateProduct(pg,product,'ANN',pg.ps[product].yearly);	
			updateProduct(pg,product,'MBD',pg.ps[product].MBD);	
	}

}

function changeProductValues(pg,product,val,which,oId)
{		
	var temp;
	tempPH.age = pg.age;
	tempPH.smokes = pg.smokes;
	tempPH.sex = pg.sex;
	tempPH.lastChanged = which;
	tempPH.ps[product].MBD = pg.ps[product].MBD;
	tempPH.ps[product].yearly = pg.ps[product].yearly;
	tempPH.ps[product].weekly = pg.ps[product].weekly;
	tempPH.ps[product].cFace = pg.ps[product].cFace;	
	if(which=='COV'){ tempPH.ps[product].cFace=val; temp=pg.ps[product].cFace;}
	else if(which =='ANN'){ tempPH.ps[product].yearly = val; temp = pg.ps[product].yearly;}
	else if(which == 'MBD'){ tempPH.ps[product].MBD = val;  temp = pg.ps[product].MBD; }
	else{ tempPH.ps[product].weekly =val; temp = pg.ps[product].weekly; }	
	calculateVals(product,tempPH);
	
	if (minMaxCheck(product,val))
	{
		console.log('****************************************cface' + which);
		console.log('RETURNED!');
			$(oId).val('$'+ temp);
	}
	else
	{
	console.log('****************************************cface' + which);
if(which=='COV'){pg.ps[product].cFace=val;}
	else if(which =='ANN'){pg.ps[product].yearly = val;}
	else if(which == 'MBD'){pg.ps[product].MBD = val;}
	else{ pg.ps[product].weekly =val;}	
		console.log('changing');
		pg.lastChanged = which;		
		calculateVals(product,pg);
		updatePowerHowerTotals();
	}

	console.log('RETURNED!');
	updatePowerHowerTotals();

}


function updateProduct(pg,product,which,val)
{	
	val = (parseFloat(val)).toFixed(2);
	$('#'+product+pg.pId+'_'+which).val('$'+ val);	
}


function updatePowerHowerTotals()
{
	ALP.reset();
	AHP.reset();

		for(var p in pHolder.ps)
		{
			if(pHolder.ps[p].added)
			{
				ALP.MBD += pHolder.ps[p].MBD;
				ALP.yearly += pHolder.ps[p].yearly;
				ALP.weekly += pHolder.ps[p].weekly;

			}

		}
		for(var p in pSpouse.ps)
		{
		   if(pSpouse.ps[p].added)
			{				
				ALP.MBD += (pSpouse.ps[p].MBD)
				ALP.yearly += (pSpouse.ps[p].yearly)
				ALP.weekly += (pSpouse.ps[p].weekly)				
			}

		}
		if(A71.added)
		{
				AHP.MBD = parseFloat(A71.MBD)
				AHP.yearly = parseFloat(A71.annual)
				AHP.weekly = parseFloat(A71.weekly)
		}
			totals.weekly = ALP.weekly + AHP.weekly;
			totals.yearly = ALP.yearly + AHP.yearly;
			totals.MBD = ALP.MBD + AHP.MBD;

		updateProduct(pHolder,'ALP','MBD',ALP.MBD);	
		updateProduct(pHolder,'ALP','ANN',ALP.yearly);	
		updateProduct(pHolder,'ALP','WKL',ALP.weekly);	

		updateProduct(pHolder,'AHP','MBD',AHP.MBD);	
		updateProduct(pHolder,'AHP','ANN',AHP.yearly);	
		updateProduct(pHolder,'AHP','WKL',AHP.weekly);	

		updateProduct(pHolder,'TTL','MBD',totals.MBD);	
		updateProduct(pHolder,'TTL','ANN',totals.yearly);	
		updateProduct(pHolder,'TTL','WKL',totals.weekly);

		updateProduct(pHolder,'DIF','MBD',policy.MBD-totals.MBD);	
		updateProduct(pHolder,'DIF','ANN',totals.yearly-totals.MBD);	
		updateProduct(pHolder,'DIF','WKL',totals.weekly-totals.MBD);


		$('#FOCm').html(2*A71.coverage);
		$('#FOCc').html();
		$('#FOCs').html();


}






}