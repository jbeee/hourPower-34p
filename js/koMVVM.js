
ko.extenders.logChange = function(target, option) {
    target.subscribe(function(newValue) {       
       console.log('updated: ' + option + ": " + newValue);
       getPowerHour.globals.synched = false;

    });
    return target;  };

ko.unapplyBindings = function ($node, remove) {
    // unbind events
    $node.find("*").each(function () {
        $(this).unbind();
    });

    // Remove KO subscriptions and references
    if (remove) {
        ko.removeNode($node[0]);
    } else {
        ko.cleanNode($node[0]);
    } };


////// FOR Testing  - certain ko setups tend to fire ALOT! slowing everything down.         
      var koCalls = {  
          Arr:[],
          t:0,
          count:function(who,what)
          {
            var cc = this;
            if(!cc.hasOwnProperty(who)){cc.Arr[who] = {};}
            if(!cc.Arr[who].hasOwnProperty(what)){cc.Arr[who][what] = 0;}
            cc.t++;
            cc.Arr[who][what]++;
            console.log('computing '+what+' CALLED by '+who+'--------- total:'+cc.t+'-------&---'+ cc.Arr[who][what]) 
          }
        }

/*
 Declare KO_Model for Policy Holder Data
        Policy Holder 
            - first name
            - last name
            - birthday - if DATA - computes age, else just sets as age
            - wage
            - gender
            - has a spouse
            - has a child
            - life insurance from work
            - life insurance outside of work

        Policy Holder"s Spouse
            - first name
            - last name
            - birthday - if DATA - computes age, else just sets as age
            - wage
            - gender
*/

var getPowerHour = new Object();

getPowerHour.globals =
    {
      current_group:0,
      current_subgroup:0,
      current_policy:-1,   
      current_state :0,
      synched:true,
      lastInput:'COV'  
    }



getPowerHour.policyjQ = function()
  {
    $('.psInputTop').mousedown(function(){
      if($(this).hasClass('RO')){return};
     var whichone = $(this).attr('class');
     whichone = whichone.replace('psInputTop','');
     getPowerHour.globals.lastInput = whichone;

       $(this).css({ 'opacity': '1' });

     });
  }



/*
    Default for policy products
           -label
           -element name
           -product allowed
           -product added
           -product face value
           -product ALH/ALP?
           -last value changed - default "Coverage"
*/

//////////////////// The Error Model and Object for the KO-observable array to track input errors
        /*
          getPowerHour.inputErrors.errArray = ko.observableArray();  
          getPowerHour.inputErrorModel = function(owner,type,terminal,msg)
          {
            var phE = this;
              phE.owner = owner;
              phE.type  = owner +'_' + type;
              phE.msg = msg;
              phE.terminal = terminal;
              phE.isValid = ko.observable(true);
          }

          getPowerHour.inputErrors = {'errArray':[]}
         
          getPowerHour.inputErrors.removeError = function(type,pid)
                {
                  getPowerHour.inputErrors.errArray.remove(function(err){
                  return err.type == pid+'_'+type;})           
                }
          getPowerHour.inputErrors.addError = function(type,terminal,msg,pid)
                { 
                  getPowerHour.inputErrors.errArray.remove(function(err){
                  return err.type == pid+'_'+type;})
                  console.log(pid + '-' + type +': '+ msg);
                  getPowerHour.inputErrors.errArray.push(new getPowerHour.inputErrorModel(pid,type,terminal,msg,0));
                  ko.utils.arrayForEach(getPowerHour.inputErrors.errorArray(), function(item) {});          
                }
          */
getPowerHour.inputErrors = function(){
  var ie = this;
  ie.errArray = {};
  ie.initError = function(type,owner)
    {
        var phE = {
          owner:owner,
          id: owner +'_'+ type,
          msg: ko.observable(),
          lastValid: ko.observable(0),
          terminal: ko.observable(false),
          hasError: ko.observable(false).extend({logChange: owner +'_'+ type + ' errors? '})
          }
         
        ie.errArray[phE.id] = phE; 
        console.log('Init Error: '+ ie.errArray[phE.id].id); 

        ie.showErrorClass = ko.computed(function(){ 
              if(ie.errArray[phE.id].hasError())
              {
                 ie.errArray[phE.id].id;
              }
              else
              {
                 
              }
             },ie);
       };
  ie.removeError = function(type,owner,val)
        {
           console.log('Set last Valid: '+ owner+'_'+ type +': '+ val);
           var errId = owner+'_'+ type;
          if(ie.errArray[errId].hasError())
            {
              ie.errArray[errId].hasError (false);
              ie.errArray[errId].terminal (false);
              ie.errArray[errId].msg ('');
              ie.errArray[errId].lastValid (val);
            }      
        };
  ie.addError = function(type,owner,msg,terminal)
        { 
          if(getPowerHour.globals.loadingNew){return}
              var errId = owner+'_'+ type;
              console.log('Added Error: '+ owner+'_'+ type +': '+ msg);
              ie.errArray[errId].hasError (true);
              ie.errArray[errId].terminal (terminal);
              ie.errArray[errId].msg (msg);      
        }          

  };

//////////////////// The TabOrder - Selected Input Array & methods - puts the focus on the next empty input in the order-queue
getPowerHour.focusLogic= {'orderArray':[]}

getPowerHour.policyHolderModelKO = function(mId)
  { 
    var ph = this;  
    ph.mId = mId;
    ph.allowPH = ko.observable();  
    ph.age = ko.observable();

    ph.addComputed = function()
      {
          pmE.initError('Birthday_Age',ph.mId);
          pmE.initError('Hourly_Wage',ph.mId);
      //// format AGE 
          ph.formatAge = ko.computed(function(){       
              var newAge = parseBday(ph.birthday(), ph.mId)
              if(newAge[0]){
                ph.birthday(newAge[2]); 
                pmE.removeError('Birthday_Age',ph.mId,newAge[1]);
                  ph.age (newAge[1]);  
                  return newAge[1];
              }
               else{
                 pmE.addError('Birthday_Age',ph.mId,newAge[1],true)
               }

          }, ph); 
      //// format AGE 
          ph.genderCHK = ko.computed({ 
              read:function(){               
                           
                if(ph.gender() == 'F')
                 {
                    return true;
                 }
                 else
                 {               
                   return false;
                 };
               },
               write:function(val)
               {
                 if(val)
                 {
                    ph.gender('F')
                 }
                 else
                 {               
                   ph.gender('M')
                 };
               }, owner:ph}); 
      //// format Tobacco Use 
          ph.TUCHK = ko.computed({ 
              read:function(){               
                           
                if(ph.TU() == 'TU')
                 {
                    return true;
                 }
                 else
                 {               
                   return false;
                 };
               },
               write:function(val)
               {
                 if(val)
                 {
                    ph.TU('TU');
                 }
                 else
                 {               
                   ph.TU('NTU');
                 };
               }, owner:ph}); 
        //// format WAGE         
      
          ph.setWage = ko.computed({ 
              read:function(){ 
                 if(ph.wage() == '')
                 {
                    return;
                 }
                 if(ph.wage() < 5){
                     ph.allowPH(false)
                    }
                  else{ 
                     ph.allowPH(true);                  
                    }
                 return formatMoney(ph.wage());
               },
               write:function(val)
               {
                  var newWage = validFloat(val,false);      
                  if(newWage[0])
                  {
                    ph.wage(newWage[1]);                                       
                    pmE.removeError('Hourly_Wage',ph.mId,newWage[1]);
                  }
                  else
                  {                   
                    pmE.addError('Hourly_Wage',ph.mId,newWage[1],false);
                  };
               }, owner:ph}); 


        ph.checkMinimumReqs = ko.computed(function(){ 
          ////// returns bitwise check where 1111 =  has all reqs and 0000 has none
         var minbits = 0|(((ph.age()!='')&&(ph.age()!= undefined))?8:0);  /// check if valid age
         minbits=minbits|(((ph.TU()== 'TU')||(ph.TU()== 'NTU'))?4:0); /// check if valid TU 
         minbits=minbits|(((ph.gender()== 'M')||(ph.gender()== 'F'))?2:0);/// check if valid gender
         minbits=minbits|(((ph.wage()!='')&&(ph.wage()!= undefined))?1:0);/// check if valid wage
         return minbits;
              }, ph); 
      }  


  }

//////////////////// ***** THE KNOCKOUT MODEL FOR POLICY PRODUCT
getPowerHour.policyProductModelKO = function(pId)
  {
     var ppKO = this;
     ppKO.pId = pId;

      ////////// the unformated values for each product element
     ppKO.MBD = ko.observable();
     ppKO.YRL = ko.observable();
     ppKO.WKL = ko.observable();
     ppKO.COV = ko.observable();

     ppKO.allowed = ko.observable(true).extend({logChange: pId + ' allowed '}); 
     ppKO.ratio = ko.observable(0).extend({logChange: pId + ' RATIO '});

     pmE.initError('MBD',pId);
     pmE.initError('YRL',pId);
     pmE.initError('WKL',pId);
     pmE.initError('COV',pId);

     ppKO.uCOV = 0;
     ppKO.WHLvals = [];

    ppKO.initComputed = function()
      { 
        ppKO.setCOV = ko.computed({ 
            read:function(){ 
            var newCOV = minMaxCheck(ppKO.lbl,ppKO.COV());
            console.log(newCOV+"  "+ppKO.COV());
              if(newCOV[0])
                {                  
                  countMe('COV',ppKO.pId,newCOV[1]);
                  if(ppKO.ratio())
                  {
                    ppKO.YRL(ppKO.ratio()*ppKO.COV()*(0.001));
                  }                    
                  return formatMoney(newCOV[1]);                    
                }
              else
                {
                    pmE.addError('COV',ppKO.pId,newCOV[1],true);
                }                 
             },
             write:function(val)
             { 
              console.log('write COV' + val);
               var newCOV = validFloat(val,true);
               if(newCOV[0])
               {
                console.log('write COV' + newCOV[1]);
                if(ppKO.lbl=='WHL'){if(!ppKO.bestCategory('COV',newCOV[1])){return;}};
                calculateVals('COV',newCOV[1],'writeCOV');
               }
               else
               {
                  pmE.addError('COV',ppKO.pId,newCOV[1],false);
               }
             }, owner:ppKO}).extend({logChange: pId + ' COV'});

       ppKO.setYRL = ko.computed({ 
            read:function(){ 
                var newYRL = ppKO.YRL();                  
                console.log('read YRL' + newYRL); 
                countMe('YRL',ppKO.pId,newYRL);
                return formatMoney(newYRL);
             },
             write:function(val)
             { 
               var newYRL = validFloat(val,true);
               console.log('write YRL' + newYRL[1]);
               if(newYRL[0])
               { 
                 if(ppKO.lbl=='WHL'){ppKO.bestCategory('YRL',newYRL[1])};                
                 calculateVals('YRL',newYRL[1],'writeYRL');
               }
               else
               {
                  pmE.addError('YRL',ppKO.pId,newYRL[1],false);
               }
             }, owner:ppKO}).extend({logChange: pId + ' YRL'});

         ppKO.setMBD = ko.computed({ 
            read:function(){ 
                var newMBD = ppKO.YRL()/12;                  
                console.log('read MBD' + newMBD ); 
                countMe('MBD',ppKO.pId,newMBD);
                ppKO.MBD(newMBD);
                return formatMoney(newMBD);
             },
             write:function(val)
             { 
               var newMBD = validFloat(val,true);
               console.log('write MBD' + newMBD[1]);
               if(newMBD[0])
               {  
                 if(ppKO.lbl=='WHL'){ppKO.bestCategory('MBD',newMBD[1])};               
                 calculateVals('MBD',newMBD[1],'writeMBD');
               }
               else
               {
                  pmE.addError('MBD',ppKO.pId,newMBD[1],false);
               }
             }, owner:ppKO}).extend({logChange: pId + ' MBD'});  

        ppKO.setWKL = ko.computed({ 
            read:function(){ 
                var newWKL = ppKO.YRL()/52;                  
                console.log('read WKL' + newWKL ); 
                countMe('WKL',ppKO.pId,newWKL);
                ppKO.WKL(newWKL);
                return formatMoney(newWKL);
             },
            write:function(val)
             { 
               var newWKL = validFloat(val,true);
               console.log('write WKL' + newWKL[1]);
               if(newWKL[0])
               {
                if(ppKO.lbl=='WHL'){bestCategory('WKL',newWKL[1])};                 
                 calculateVals('WKL',newWKL[1],'writeWKL');
               }
               else
               {
                  pmE.addError('WKL',ppKO.pId,newWKL[1],false);
               }
             }, owner:ppKO}).extend({logChange: pId + ' WKL'}); 

      }
         

   ppKO.TYRFXNS = function()
      {    
        ppKO.ogDUR = 1;  
        ppKO.uDUR = 1;       
        pmE.initError('DUR',pId);


        ppKO.setTYRVals = ko.computed(function(){
          if(((pmM[ppKO.owner].checkMinimumReqs()&14)!=14)||(pmM[ppKO.owner].age() > defArr['TYR'].maxAge))
           {
            ppKO.allowed(false);
            return;
           } ///1110, has age, gender, tu & checks if within valid age range
            ppKO.allowed(true);

            pmM[ppKO.owner].TUCHK();
            pmM[ppKO.owner].genderCHK();
            pmM[ppKO.owner].birthday();        
            ppKO.ratio(dataArr['TYR'][pmM[ppKO.owner].gender()][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age()]);       
           }, ppKO);

        ppKO.watchWages = ko.computed(function(){
              if((pmM[ppKO.owner].checkMinimumReqs()&1)!=1){return;} ///0001 checks if wage is set                
              var newCOV = ppKO.ogDUR*pmM[ppKO.owner].wage()*1920;
                calculateVals('COV',newCOV,'watchwages');                       
            }, ppKO);         

        ppKO.setDur = ko.computed(function(){ 
            ppKO.uDUR = ppKO.DUR()/ppKO.ogDUR;
            calculateVals('DUR',ppKO.uDUR,'setDUR');
            ppKO.ogDUR = ppKO.DUR();
          }, ppKO);


      }


    ppKO.A71FXNS = function()
      {        

        ppKO.setCOV = ko.observable();
        ppKO.setYRL = ko.observable();
        ppKO.setMBD = ko.observable();
        ppKO.setWKL = ko.observable();


        //// Check if Policy Holder has a valid age, and if age is within A71000 Range
        ppKO.allowA71 = ko.computed(function(){

              if((pmM[ppKO.owner].checkMinimumReqs()&8)!=8)///1000, has age 
                { 
                   ppKO.allowed(false);
                   return;
                } 
              else if(pmM.p.age()>74)
                {
                   ppKO.allowed(false);
                }
              else
                {
                   ppKO.allowed(true);
                }
            },ppKO);


        /* 
          If Policy Holder doesn't have a family, no family option
          default:Family
        */
        ppKO.allowFamily = ko.computed({
            read:function(){
                if(!ppKO.allowed()){return;};
                if(pm.hasChild()||pm.hasSpouse())
                 {
                    ppKO.ftype('Family');
                    return true;
                 }
                else if(ppKO.ftype()=='Family')
                 {
                    ppKO.ftype('Individual');
                 }
                return false;
              },owner:ppKO});


        /*
          If Policy Holder is over 65 No Double or Triple option
          default:Double
        */
        ppKO.allowDouble = ko.computed({
            read:function(){  
              if(!ppKO.allowed()){return;};          
              if(pmM.p.age()>defArr['A71'].maxDoubleAge)
                {              
                  ppKO.ctype('1');
                  return false;
                }
              defArr['A71'].ctype;
              return true;
             },owner:ppKO});


        ////Get Policy Holders age range and corresponding A71000 rate
        ppKO.ageBracket = ko.observable();

        ppKO.getMBD = ko.computed(function(){
          if(!ppKO.allowed()){return;};
          for(i=0;i<dataArr['A71']['categories'].length;i++){ 
              if(pmM.p.age()< dataArr['A71']['categories'][i])
              {
                ppKO.ageBracket(i);
                return;
              }
            }
          }, ppKO);


        ////Calculate A71000 Weekly, MBD, Annual costs based on rate and policy options
        ppKO.setA71Vals = ko.computed(function(){ 
           if(!ppKO.allowed()){return;};
           ppKO.COV(defArr['A71'].defaultCov*ppKO.ctype());  
           ppKO.MBD(dataArr['A71'][ppKO.ftype()][ppKO.ctype()][ppKO.ageBracket()][0]);
           ppKO.YRL(dataArr['A71'][ppKO.ftype()][ppKO.ctype()][ppKO.ageBracket()][1]);
           ppKO.WKL(ppKO.YRL()/52);
            
           countMe('COV',ppKO.pId,ppKO.COV());
           countMe('YRL',ppKO.pId,ppKO.YRL());
           countMe('MBD',ppKO.pId,ppKO.MBD());
           countMe('WKL',ppKO.pId,ppKO.WKL());
          }, ppKO).extend({logChange: pId + ' A71'}); 
      }

    ppKO.WHLFXNS = function()
    {      
      ppKO.categoryName = ko.observable().extend({logChange: pId + ' category changed '});      
      ppKO.WHLvalsCalc =function(cat,ratio,min,max){
        ppKO.WHLvals[cat] ={};
        ppKO.WHLvals[cat].ratio = ratio;
        ppKO.WHLvals[cat].COV=min;
        ppKO.WHLvals[cat].YRL=(min*ratio)/1000;
        ppKO.WHLvals[cat].MBD=ppKO.WHLvals[cat].YRL/12;
        ppKO.WHLvals[cat].WKL=ppKO.WHLvals[cat].YRL/52;
        ppKO.WHLvals[cat].max=max;        
      }


      ///// generate Whole life values for each category based on age/tabacco-use/gender
      ppKO.calcRateVals = ko.computed(function(){    
       
        if((pmM[ppKO.owner].checkMinimumReqs()&14)!=14){ppKO.allowed(false); return;} ///1110,has age,gender,tabacco-use
        ppKO.allowed(false);          
        pmM[ppKO.owner].TUCHK();
        pmM[ppKO.owner].genderCHK();
        pmM[ppKO.owner].birthday();
        var G = pmM[ppKO.owner].gender();
        var T = pmM[ppKO.owner].TU();
        var A = pmM[ppKO.owner].age();

        for(var i=0;i<defArr['WHL']['categories'].length;i++)
          {
            ppKO.WHLvalsCalc(i,dataArr['WHL'][G][T][A][i],defArr['WHL']['categories'][i]['min'],defArr['WHL']['categories'][i]['max']);           
          }

        ppKO.ratio(dataArr['WHL'][G][T][A][ppKO.category()]);
        ppKO.categoryName(defArr['WHL']['categories'][ppKO.category()]['lbl'])

       }, ppKO);

      

      ///// Calculate optimal category based on MBD Values - show message when customer could be saving money?  
      ppKO.bestCategory = function(which,val)
      {
        var catsTotal = ppKO.WHLvals.length -1;
        var isCOV = false;
        var newCat;
        var originalVal = val;

        if(which == 'COV')
         {
            isCOV = true;
            which = 'YRL'; 
            val=(val*ppKO.WHLvals[ppKO.category()].ratio)/1000
         }

         for(var i=0;i<=catsTotal;i++)
          {
            if((val >= ppKO.WHLvals[i][which]))   
            { 
              if(((i<catsTotal)&&(val<=ppKO.WHLvals[i+1][which]))||(i==catsTotal))
              {                
                ppKO.categoryName(defArr['WHL']['categories'][i].lbl);
                newCat = i;                                            
              }
              else if(i==catsTotal)
              {
                ppKO.categoryName(defArr['WHL']['categories'][i].lbl);
                newCat = i;
              }                         
            }
           }
       
         
         if((isCOV)&&(newCat!=ppKO.category()))  /// if category changes, update
          { 
            console.log('newCatagory: '+newCat); /// add message here!
            ppKO.category(newCat); 
            ppKO.setYRL(val);
            return false;
          } 
        else
        {
          ppKO.category(newCat);
          return true;
        }                      
       }            

    }

    ppKO.ADBFXNS = function()
    { 
        
       ppKO.calcRatio = ko.computed(function(){ 
        if((pmM[ppKO.owner].checkMinimumReqs()&8)!=8){return;} ///has age 1000 vals
        for(var i=0;i<dataArr['ADB']['age'].length;i++)
          {
            if(pmM[ppKO.owner].age()<= dataArr['ADB']['age'][i])
            {         
                ppKO.ratio(dataArr['ADB']['ratio'][i]);               
                return;
            }
          }        
        }, ppKO); 

    }
    
    ppKO.SPRFXNS = function()
    {
        ppKO.setRate = ko.computed(function(){
            if(((pmM['sp'].checkMinimumReqs()&12)!=12)||(pmM['sp'].age()>defArr['SPR'].maxAge)) ///spouse has age & TU and under max
              {
                ppKO.allowed(false);
                return;
              } 
            ppKO.ratio(dataArr['SPR'][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age()]); 
            ppKO.allowed(true);

         }, ppKO); 
    }

    ppKO.CHRFXNS = function()
      {      
        ppKO.ratio(dataArr['CHR']); 
      }


    function calculateVals(which,val,where)
          {            
            console.log('UPDATE FROM '+ where);
            var tempCOV = 0;
            switch(which)
             {
                case 'COV':
                  tempCOV = val;                    
                break;
                case 'YRL':
                  tempCOV = (val*1000)/ppKO.ratio();        
                break;
                case 'MBD':
                  tempCOV = ((val*1000)/ppKO.ratio())*12;
                break; 
                case 'WKL':
                  tempCOV = ((val*1000)/ppKO.ratio())*52;
                break;
                case 'DUR':
                  tempCOV = ppKO.COV()*val;
                break;
              }
              ppKO.COV(tempCOV);                
            } 

  }

getPowerHour.policyModelKO = function() 
  {
    var pmKO = this;
    pmKO.availableDUR = ko.observableArray([{val:0.5, showVal:'6 Months'},{val:1, showVal:'1 Year'},{val:1.5, showVal:'1.5 years'},{val:2, showVal:'2 years'},{val:2.5, showVal:'2.5 years'},{val:3, showVal:'3 years'},{val:3.5, showVal:'3.5 years'},{val:4, showVal:'4 years'},{val:4.5, showVal:'4.5 years'},{val:5, showVal:'5 years'},{val:6, showVal:'6 years'}]);
    pmKO.hasSpouse = ko.observable().extend({logChange: 'Spouse allowed on policy (has Name or Birthday)'});
       /* 
        The initialization functions and all declarations 
        specific to the KO hourpower policy sheet
      */
      pmKO.init = function(){

        pmE.initError('Power_Hour','Custom');
        

        pmKO.sumWagesCVAL = ko.computed(function(){
              var newSum = 0;
              for(var m in pmM)
              {
                  newSum += pmM[m].wage();
              } 
              if(newSum < 25){return;}
                pmKO.cVal(newSum);          
              },pmKO);

        pmKO.setCVal = ko.computed({
            read:function(){
              koCalls.count('CVAL','read');   ////trackinging ko calls  
              if(pmKO.cVal()==0){pmKO.cVal(25)}               
              return formatMoney(pmKO.cVal());
                },
            write: function(val)
            {
              var newCVal = validFloat(val,true);      
                  if(newCVal[0])
                      {
                        pmKO.cVal(newCVal[1]);                                       
                        pmE.removeError('Power_Hour','Custom',newCVal[1]); 
                      }
                      else
                      {                   
                        pmE.inputErrors.addError('Power_Hour','Custom',newCVal[1],false);
                      };
            }, owner:pmKO }).extend({logChange:'CVAL'});

          pmKO.phTypeCheck = ko.computed(function(){
                 if(pmKO.phType()=="MH") /// use policy holder wage as HOUR
                  {
                    if(pmM.p.allowPH()){
                       pmKO.phVal(pmM.p.wage());                     
                    }
                    else
                    {
                      pmKO.phVal(pmKO.cVal());
                      pmKO.phType("CH"); /// use custom value as HOUR
                    }
                     
                  }
                  else
                  {                       
                       pmKO.phVal(pmKO.cVal()); 
                  }
              },pmKO);

          /// if spouse name or birthday changes to anything but an empty string, assumes you want to use the spouse
          pmKO.spouseCheck = ko.computed(function(){ 
                if((pmM.sp.fname() != '')||(pmM.sp.birthday() != ''))
                {
                  pmKO.hasSpouse(true);
                }
                else
                {
                  pmKO.hasSpouse(false);
                }
              }, pmKO);


           pmKO.allowRiders = ko.computed(function(){ 
               if(!pmKO.hasSpouse())
                {
                    for(var product in pmP)
                    {
                      if(pmP[product].owner == 'sp')
                      {
                        console.log(product)
                        pmP[product].allowed(false);
                        console.log(product + pmP[product].allowed());
                      }
                    }
                }
                else
                {
                   for(var product in pmP)
                    {
                      if(pmP[product].owner == 'sp')
                      {                       
                        pmP[product].allowed(true);
                        console.log(product + pmP[product].allowed());
                      }
                    }
                }

                if(!pmKO.hasChild())
                  {
                    pmP['pCHR'].allowed(false);
                  }
                  else
                  {
                    pmP['pCHR'].allowed(true);
                  }
            }, pmKO); 

       var lastSP = [true,true];

       pmKO.watchSpouseSPR = ko.computed(function(){
            if(pmP['spSPR'].added())
             {
                pmP['spWHL'].added(false);
                lastSP = [pmP['spTYR'].added(),pmP['spADB'].added()]
             }
             else
             {
               pmP['spWHL'].added(true);
               pmP['spTYR'].added(lastSP[0]);
               pmP['spADB'].added(lastSP[1]);
             }
         },pmKO);


        pmKO.watchSpouseWHL = ko.computed(function(){
            if(pmP['spWHL'].added())
             {
               pmP['spSPR'].added(false);
               pmP['spTYR'].added(lastSP[0]);
               pmP['spADB'].added(lastSP[1]);                
             }
             else
             {
               pmP['spSPR'].added(true); 
               lastSP = [pmP['spTYR'].added(),pmP['spADB'].added()];
             }
         },pmKO);

      }


      //If new polciy, update/format data appropriately
      pmKO.isNew  = function(){
              pmKO.dateCreated = new Date();
              pmKO.state = getPowerHour.globals.current_state;
              pmKO.group = getPowerHour.globals.current_group;
              pmKO.synched = true;
              getPowerHour.globals.loadingNew = false;
               }
    }

/* 
  Knockout Observable Policy model   
*/
getPowerHour.policyApp = function(pVals) 
  {
    var pApp = this;
    pmE = new getPowerHour.inputErrors();
    pm = new getPowerHour.policyModelKO();
    /*
       Declare all neccessary observable/non-observable variables
       Adds in data from the model sent to the new KO policy model
       All the important stuff
    */
      pApp.init = function(){  
       ///////////////////////////////////// declare all necessary arrays, data, and functions.   
        pmM = {};
        pmP={};
        //////////////// Add all properties from the hour power policy data model         
          for(var attr in pVals){               
              switch(attr)
               {                
                case '_id': ///// Check if new policy or old one             
                  pm.id = pVals['_id'];
                  pm.dateCreated = pVals['dateCreated'];
                  pm.state = pVals['state'];
                  pm.group = pVals['group'];
                break;
           
                case 'dateCreated':
                case 'state':
                case 'group':
                break;

                case 'members': /////// Declare and populate Members Array Attributes ------- FIX THIS!
                  for(var m in pVals.members)
                    { 
                          pmM[m] = new getPowerHour.policyHolderModelKO(m);            

                          for(var attr in pVals.members[m])
                                {
                                    if(pmM[m].hasOwnProperty(attr))
                                    {
                                        pmM[m][attr](pVals.members[m][attr])
                                    }
                                    else
                                    {    
                                        pmM[m][attr] = ko.observable( pVals.members[m][attr] ).extend({logChange: attr});                                            
                                    } 
                                    console.log(m+"  - "+attr+": "+pmM[m][attr]())                                  
                                }  
                          pmM[m].addComputed();                       
                     }
                break;
                case 'products':     /////////////// Declare and populate Products Array Attributes
                  for(var p in pVals.products)
                    {                       
                       pmP[p] = new getPowerHour.policyProductModelKO(p);
                      for(var attr in pVals.products[p])
                        {
                          if((attr == 'lbl' ) || (attr == 'owner' )||(attr == 'ALHP' ))
                          {
                              pmP[p][attr] = pVals.products[p][attr];
                          }
                          else if(pmP[p].hasOwnProperty(attr))
                          {
                            pmP[p][attr](pVals.products[p][attr])
                          }
                          else
                          {
                            pmP[p][attr]=ko.observable(pVals.products[p][attr]).extend({logChange: p+' - ' + attr}); 
                          }
                                                    
                        } 
                        
                      switch(pmP[p].lbl)
                        {
                            case 'A71':
                               pmP[p].A71FXNS();
                            break;
                            case 'TYR':
                              pmP[p].TYRFXNS();
                              pmP[p].initComputed();
                            break;
                            case 'WHL':
                              pmP[p].WHLFXNS();
                              pmP[p].initComputed();                           
                            break; 
                            case 'ADB':
                              pmP[p].ADBFXNS();
                              pmP[p].initComputed();                           
                            break; 
                            case 'CHR':
                              pmP[p].CHRFXNS();
                              pmP[p].initComputed();                           
                            break;
                            case 'SPR':
                              pmP[p].SPRFXNS();
                              pmP[p].initComputed();                           
                            break;                       
                        }

                         
                         
                     }    


                   break;
                default: /////////////// All other Policy Model Declaration                    
                    if(jQuery.type(pVals[attr]) == 'array'){
                        newAttrVal = pVals[attr][0];
                      }
                    else
                    {
                        newAttrVal = pVals[attr];
                    }  
                    if(pm.hasOwnProperty(attr))
                          {
                              pm[attr](newAttrVal)
                          }
                          else
                          {    
                              pm[attr] = ko.observable(newAttrVal).extend({logChange: attr});                                             
                          } 
                          console.log(attr+" : "+pm[attr]()) 
                break;
              }
            }      
          }

 

    // put underneath to work - pmKO.showError = ko.computed( function(){ console.log(pmE.errArray['sp_Birthday_Age'].isValid());}, pmKO);



    // The Logic Order - init, init-computed - if(new){format new}
    if(getPowerHour.globals.current_policy == -1){getPowerHour.globals.loadingNew = true};
    
    pApp.init();    
    
    pm.init();

    if(getPowerHour.globals.loadingNew){pm.isNew()};
    
    getPowerHour.policyjQ();

   }



/* The declarations and initializations */
var pm;  /// the policy model
var pmE; /// the policy error array
var pmM; /// the policy member array
var pmP; /// the policy products array

var newPMKO = new getPowerHour.policyApp(newPolicy);
ko.applyBindings(newPMKO); 











