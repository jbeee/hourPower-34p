
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
      lastInput:'COV',
      startConcept: 'D',
      showDefaults: [true,true,true,true]  
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
        
    };
  ie.removeError = function(type,owner,val)
        {
           var errId = owner+'_'+ type;
          if(ie.errArray[errId].hasError())
            {
              ie.errArray[errId].hasError (false);
              ie.errArray[errId].terminal (false);
              ie.errArray[errId].msg ('');              
            }      
          ie.errArray[errId].lastValid (val);
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
getPowerHour.policyProductModelKO = function()
  {
     var ppKO = this;

     ////////// the unformated values for each product element
     ppKO.MBD = ko.observable();
     ppKO.YRL = ko.observable();
     ppKO.WKL = ko.observable();
     ppKO.DLY = ko.observable();
     ppKO.COV = ko.observable();
     ppKO.allowed = ko.observable(false);    
     ppKO.tempCOV = ko.observable(0);
     ppKO.allowedProductSpecific = ko.observable(true);    


     ppKO.writeInput = function(which,val)
     {
        console.log('write  '+ppKO.pId+'  '+which+' ' + val);
                     var newVal = validFloat(val,true);
                     if(newVal[0])
                     {
                        if(ppKO.lbl=='WHL')
                          {
                           if(!ppKO.bestCategory(which,newVal[1])){return;}
                          }                          
                        ppKO.calculateVals(which,newVal[1]);
                     }
                     else
                     {
                        pmE.addError(which,ppKO.pId,newVal[1],false);
                     }
     }
     ppKO.readInput = function(which,val)
     {
         console.log('read '+ppKO.pId+' '+which+':'+ val); 
         countMe(which,ppKO.pId,val);
         formatMoney(val);
     }
         ////////////////////////////////////////////////////////////////////// unobserved general product fxns
    ppKO.calculateVals = function(which,val,where)
          {            
            var tCOV = 0;
            switch(which)
             {
                case 'COV':
                  tCOV = val;                    
                break;
                case 'YRL':
                  tCOV = (val*1000)/ppKO.ratio();        
                break;
                case 'MBD':
                  tCOV = ((val*1000)/ppKO.ratio())*12;
                break; 
                case 'WKL':
                  tCOV = ((val*1000)/ppKO.ratio())*52;
                break;
                case 'DLY':
                  tCOV = ((val*1000)/ppKO.ratio())*365;
                break;
                case 'DUR':
                  tCOV = ppKO.COV()*val;
                break;
              }
              ppKO.tempCOV(tCOV);                
            } 
    //////////////////////////////////////////////////////////////////////////////////////// Init Fxns
    ppKO.initComputed = {
        ALP : function(){

              ppKO.setCOV = ko.computed({ 
                  read:function(){              
                  var newCOV = minMaxCheck(ppKO.lbl,ppKO.tempCOV());
                  console.log('read '+ppKO.pId+' COV '+newCOV); 
                    if(newCOV[0])
                      {                               
                        countMe('COV',ppKO.pId,newCOV[1]);
                        if(ppKO.ratio())
                        {
                          ppKO.COV(newCOV[1]);  
                        }                    
                        return formatMoney(newCOV[1]);                    
                      }
                    else
                      {                          
                          return formatMoney(ppKO.COV());
                      }                 
                   },
                   write:function(val)
                   { 
                     ppKO.writeInput('COV',val);
                     }, owner:ppKO });

              ppKO.setYRL = ko.computed({ 
                  read:function(){ 
                      ppKO.YRL(ppKO.ratio()*ppKO.COV()*(0.001));
                      return ppKO.readInput('YRL',ppKO.YRL());
                   },
                   write:function(val)
                   { 
                     ppKO.writeInput('YRL',val);
                    }, owner:ppKO });

              ppKO.setMBD = ko.computed({ 
                  read:function(){ 
                      ppKO.MBD(ppKO.YRL()/12);
                      return ppKO.readInput('MBD',ppKO.MBD());
                   },
                   write:function(val)
                   { 
                     ppKO.writeInput('MBD',val);
                     }, owner:ppKO})

              ppKO.setWKL = ko.computed({ 
                  read:function(){ 
                      ppKO.WKL(ppKO.YRL()/52);                  
                      return ppKO.readInput('WKL',ppKO.WKL());
                   },
                  write:function(val)
                   { 
                      ppKO.writeInput('WKL',val);
                     }, owner:ppKO})

              ppKO.setDLY = ko.computed({ 
                  read:function(){ 
                      ppKO.DLY(ppKO.YRL()/365);   
                      return ppKO.readInput('DLY',ppKO.DLY());
                   },
                  write:function(val)
                   { 
                      ppKO.writeInput('DLY',val);
                     }, owner:ppKO})

              ppKO.setAllowed = ko.computed({
                read:function(){ 
                  if(ppKO.minInfo == -1){return;} /// no checks i.e. child riders
                  
                  if(((pmM[ppKO.owner].checkMinimumReqs()&ppKO.minInfo)==ppKO.minInfo)) ///spouse has age & TU and under max
                  {
                    if((pmM[ppKO.owner].age()<=defArr[ppKO.lbl].maxAge)&&(pmM[ppKO.owner].age()>=defArr[ppKO.lbl].minAge))
                      {
                        if(ppKO.owner=='sp' && !pm.hasSpouse())
                        {
                          ppKO.allowed(false);
                          return;
                        }
                        else if(!ppKO.allowedProductSpecific())
                        {
                          ppKO.allowed(false);
                          return;
                        }
                        
                        ppKO.allowed(true);
                        return;
                      }
                  }
                    ppKO.allowed(false);
                    return;
                 }, owner:ppKO});                          
           
              //initialize with default coverages after all vals set
              ppKO.tempCOV(ppKO.COV()); 

            },
        AHP : function(){ 
          ppKO.COV(defArr[ppKO.lbl].defaultCov);         

          ppKO.watchMBD= ko.computed( function()
            {
                var newMBD = ppKO.MBD();
                var newYRL = newMBD*12;
                var newWKL = newYRL/52; 
                var newDLY = newYRL/365;
             
                countMe('YRL',ppKO.pId,newYRL);
                countMe('MBD',ppKO.pId,newMBD);
                countMe('WKL',ppKO.pId,newWKL);
                countMe('DLY',ppKO.pId,newDLY);
            }, ppKO);

          ppKO.watchCat= ko.computed( function()
            {
                var newCOV = defArr[ppKO.lbl].defaultCov*ppKO.ctype();
                countMe('COV',ppKO.pId,newCOV);
            }, ppKO);
          
          ppKO.setAllowed = ko.computed(function(){ 
              if(((pmM[ppKO.owner].checkMinimumReqs()&8)!=8)||(pmM[ppKO.owner].age()<defArr[ppKO.lbl].minAge)||(pmM[ppKO.owner].age()>defArr[ppKO.lbl].maxAge))
                {
                  ppKO.allowed(false); 
                }
              else if(ppKO.owner=='sp' && !pm.hasSpouse())
              {
                ppKO.allowed(false); 
              } 
              else 
                {
                  ppKO.allowed(true);
                }     
             }, ppKO);

        }    
      }
                            

    ppKO.initProductFxns={
      A71000:function() /////////////////////////////////////////////////////////////////////////////////////// A71000
        {     
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
                if(pmM.p.age()>defArr[ppKO.lbl].maxDoubleAge)
                  {              
                    ppKO.ctype('1');
                    return false;
                  }
                defArr[ppKO.lbl].ctype;
                return true;
               },owner:ppKO});

          ////Calculate A71000000 Weekly, MBD, Annual costs based on rate and policy options
          ppKO.ageGroup = ko.computed({
            read:function(){
            if(!ppKO.allowed()){return -1;};
            for(i=0;i<dataArr[ppKO.lbl]['categories'].length;i++){ 
                if(pmM.p.age()< dataArr[ppKO.lbl]['categories'][i])
                {
                  return i;
                }
              }
            }, owner:ppKO}); 

          ppKO.setMBD = ko.computed(function(){
              var ag = ppKO.ageGroup();
              if(ag == -1){return;};
              ppKO.MBD(dataArr[ppKO.lbl][ppKO.ftype()][ppKO.ctype()][ppKO.ageGroup()][0]);
            }, ppKO);          
        },

      B2000:function()///////////////////////////////////////////////////////////////////////////////////////// B2000
        {

             ppKO.setB2000Vals = ko.computed(function(){ 
                if(!ppKO.allowed()){return;};              
                 ppKO.COV(defArr[ppKO.lbl].defaultCov*ppKO.ctype()); 
                 var mbd = dataArr[ppKO.lbl].ratio*ppKO.ctype();
                 ppKO.MBD(mbd);
           

            }, ppKO).extend({logChange: ppKO.pId + ' '+ppKO.lbl}); 
        },

      WHL:function() ////////////////////////////////////////////////////////////////////////////////////////// WHL
        { 
          ppKO.WHLvals = [];  
          ppKO.categoryName = ko.observable().extend({logChange: ppKO.pId + ' category changed '});
          ppKO.category = ko.observable(0);


          ppKO.seniorWHL = {
          mins:{ COV:25000, YRL:0, MBD:0, WKL:0,DLY:0},
          required:false,          
          check:function(G,T,A){
              if(A > defArr['WHL']['seniorMins'][G][T])
                { 
                    var newRat = dataArr[ppKO.lbl][G][T][A][0];
                    
                    this.mins['YRL'] = (25000*newRat)/1000;
                    this.mins['MBD'] = this.mins['YRL']/12;
                    this.mins['WKL'] = this.mins['YRL']/52;
                    this.mins['DLY'] = this.mins['DLY']/365;
                    if(ppKO.COV()<this.mins['COV'])
                    {
                      ppKO.tempCOV(this.mins['COV']);
                    }
                    return true;
                }
                return false;          
               }  
          };      

          ppKO.WHLvalsCalc =function(cat,ratio,min,max){
              ppKO.WHLvals[cat] ={};
              ppKO.WHLvals[cat].ratio = ratio;
              ppKO.WHLvals[cat].COV=min;
              ppKO.WHLvals[cat].YRL=(min*ratio)/1000;
              ppKO.WHLvals[cat].MBD=ppKO.WHLvals[cat].YRL/12;
              ppKO.WHLvals[cat].WKL=ppKO.WHLvals[cat].YRL/52;
              ppKO.WHLvals[cat].DLY=ppKO.WHLvals[cat].YRL/365;
              ppKO.WHLvals[cat].max=max;        
            }

          

          ///// generate Whole life values for each category based on age/tabacco-use/gender
          ppKO.calcRatioVals = ko.computed(function(){ 
              if(!ppKO.allowed()){return;};       
              pmM[ppKO.owner].TUCHK();
              pmM[ppKO.owner].genderCHK();
              pmM[ppKO.owner].birthday();
              var G = pmM[ppKO.owner].gender();
              var T = pmM[ppKO.owner].TU();
              var A = pmM[ppKO.owner].age();               

              for(var i=0;i<defArr[ppKO.lbl]['categories'].length;i++)
                {
                  ppKO.WHLvalsCalc(i,dataArr[ppKO.lbl][G][T][A][i],defArr[ppKO.lbl]['categories'][i]['min'],defArr[ppKO.lbl]['categories'][i]['max']); 
                }            

             }, ppKO);

          ppKO.ratio = ko.computed({
            read:function(){
              var G = pmM[ppKO.owner].gender();
              var T = pmM[ppKO.owner].TU();
              var A = pmM[ppKO.owner].age();
              ppKO.seniorWHL.required = ppKO.seniorWHL.check(G,T,A);
              ppKO.categoryName(defArr[ppKO.lbl]['categories'][ppKO.category()]['lbl']);
              return dataArr[ppKO.lbl][G][T][A][ppKO.category()];            
             
          },owner:ppKO})

          ///// Calculate optimal category based on MBD Values - show message when customer could be saving money?  
          ppKO.bestCategory = function(which,val)
            {
              var catsTotal = ppKO.WHLvals.length -1;
              var isCOV = false;
              var newCat = 0;
              var originalVal = val;
              if(ppKO.seniorWHL.required)
              {
                if(val < ppKO.seniorWHL.mins[which])
                {
                  console.log(ppKO.seniorWHL.mins['COV'])
                  console.log('Senior Whole life Message '+ ppKO.seniorWHL.mins['YRL']);           
                  false;
                }
              } 
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
                      ppKO.categoryName(defArr[ppKO.lbl]['categories'][i].lbl);
                      newCat = i;                                            
                    }
                    else if(i==catsTotal)
                    {
                      ppKO.categoryName(defArr[ppKO.lbl]['categories'][i].lbl);
                      newCat = i;
                    }                         
                  }
                 }
             
               
               if(isCOV)  /// if category changes, update
                { 
                  if(newCat>ppKO.category())
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
              else
              {
                ppKO.category(newCat);
                return true;
              }                      
             }          
        },
     
      SGWHL:function() //////////////////////////////////////////////////////////////////////////////////////// SGWHL
        { 
          ppKO.allowedProductSpecific = ko.computed(function(){    
              if((pmM[ppKO.owner].TUCHK())&&(pmM[ppKO.owner].age()>=defArr[ppKO.lbl].maxTUAge))
                {
                  return false;
                }
              else
              {
                return true;
              }
              }, ppKO);
           
            ppKO.setRate = ko.computed(function(){
              if(!ppKO.allowed()){return;};
                ppKO.ratio(dataArr[ppKO.lbl][pmM[ppKO.owner].gender()][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age()]);           
             }, ppKO); 
        },
     
      TYRC:function() ///////////////////////////////////////////////////////////////////////////////////////// 10 YRC
        {    
          ppKO.ogDUR = 1;  
          ppKO.uDUR = 1;       
          pmE.initError('DUR',ppKO.pId);

          ppKO.setTYRCVals = ko.computed(function(){
             if(!ppKO.allowed()){return;};
              pmM[ppKO.owner].TUCHK();
              pmM[ppKO.owner].genderCHK();
              pmM[ppKO.owner].birthday();        
              ppKO.ratio(dataArr[ppKO.lbl][pmM[ppKO.owner].gender()][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age()]);       
             }, ppKO);

          ppKO.watchWages = ko.computed(function(){              
                if((pmM[ppKO.owner].checkMinimumReqs()&1)!=1){return;} ///0001 checks if wage is set                
                var newCOV = ppKO.ogDUR*pmM[ppKO.owner].wage()*1920;
                  ppKO.calculateVals('COV',newCOV,'watchwages');                       
              }, ppKO);         

          ppKO.setDur = ko.computed(function(){ 
              ppKO.uDUR = ppKO.DUR()/ppKO.ogDUR;
              ppKO.calculateVals('DUR',ppKO.uDUR,'setDUR');
              ppKO.ogDUR = ppKO.DUR();
            }, ppKO);
        },

      ADB:function() ////////////////////////////////////////////////////////////////////////////////////////// ADB
        { 
           ppKO.calcRatio = ko.computed(function(){ 
              if(!ppKO.allowed()){return;};
            for(var i=0;i<dataArr[ppKO.lbl]['age'].length;i++)
              {
                if(pmM[ppKO.owner].age()<= dataArr[ppKO.lbl]['age'][i])
                {         
                    ppKO.ratio(dataArr[ppKO.lbl]['ratio'][i]);               
                    return;
                }
              }        
            }, ppKO); 
        },
      
      SPR:function() ////////////////////////////////////////////////////////////////////////////////////////// SPR
        {
            ppKO.setRate = ko.computed(function(){
              if(!ppKO.allowed()){return;};
                ppKO.ratio(dataArr[ppKO.lbl][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age()]);           
             }, ppKO); 
        },
      
      CHR:function() ////////////////////////////////////////////////////////////////////////////////////////// CHR
        {
          ppKO.ratio(dataArr[ppKO.lbl]); 

          ppKO.checkChild = ko.computed(function(){ 
                  if(!pm.hasChild())
                    {
                      ppKO.allowed(false);
                    }
                    else
                    {
                      ppKO.allowed(true);
                    }
                }, ppKO); 
        }
     }
  
    
    ppKO.init = function(pId)
     {
        ppKO.pId = pId;
        ppKO.ALHP = defArr[ppKO.lbl].ALHP;   

         $('#'+pId+'_pName').html(defArr[ppKO.lbl].name);
        
        ppKO.minInfo = defArr[ppKO.lbl].minInfo;
        
        pmE.initError('MBD',pId);
        pmE.initError('YRL',pId);
        pmE.initError('WKL',pId);
        pmE.initError('COV',pId);
        pmE.initError('DLY',pId);
        ppKO.ratio = ko.observable(0).extend({logChange: ppKO.pId + ' RATIO '});
        ppKO.initProductFxns[ppKO.lbl]();
        console.log(ppKO.ALHP);
        ppKO.initComputed[ppKO.ALHP]();
     }
     

  }

getPowerHour.policyModelKO = function() 
  {
    var pmKO = this;
    pmKO.opts_TYRC = ko.observableArray([{val:0.5, showVal:'6 Months'},{val:1, showVal:'1 Year'},{val:1.5, showVal:'1.5 years'},{val:2, showVal:'2 years'},{val:2.5, showVal:'2.5 years'},{val:3, showVal:'3 years'},{val:3.5, showVal:'3.5 years'},{val:4, showVal:'4 years'},{val:4.5, showVal:'4.5 years'},{val:5, showVal:'5 years'},{val:6, showVal:'6 years'}]);
    pmKO.opts_B2000 = ko.observableArray([{val:1, showVal:'Single'},{val:2, showVal:'Double'}]);
    pmKO.opts_A71000 = ko.observableArray([{val:1, showVal:'Single'},{val:2, showVal:'Double'},{val:3, showVal:'Triple'}]);
    pmKO.opts_dtype = ko.observableArray([{val:1.25, showVal:'$1.25'},{val:1.50, showVal:'$1.50'},{val:1.75, showVal:'$1.75'},{val:2.00, showVal:'$2.00'},{val:2.25, showVal:'$2.25'},{val:2.50, showVal:'$2.50'},{val:2.75, showVal:'$2.75'},{val:3.00, showVal:'3.00'},{val:3.25, showVal:'$3.25'},{val:3.50, showVal:'$3.50'},{val:3.75, showVal:'$3.75'},{val:4.00, showVal:'$4.00'},{val:4.25, showVal:'$4.25'},{val:4.50, showVal:'$4.50'},{val:4.75, showVal:'$4.75'},{val:5.00, showVal:'$5.00'}]);
 
    pmKO.hasSpouse = ko.observable(false).extend({logChange: 'Spouse allowed on policy (has Name or Birthday)'});

        pmKO.allowMH = ko.observable(false);
        pmKO.mVal = ko.observable();
        pmKO.dtype = ko.observable(1.75);
       /* 
        The initialization functions and all declarations 
        specific to the KO hourpower policy sheet
      */
      pmKO.init = function(){

        pmE.initError('Power_Hour','Custom');
        

        pmE.initError('MBD','total');
        pmE.initError('YRL','total');
        pmE.initError('WKL','total');
        pmE.initError('DLY','total');

        pmE.initError('MBD','used');
        pmE.initError('YRL','used');
        pmE.initError('WKL','used');
        pmE.initError('DLY','used');

        pmE.initError('MBD','diff');
        pmE.initError('YRL','diff');
        pmE.initError('WKL','diff');
        pmE.initError('DLY','diff');
        

        pmKO.setMVal = ko.computed({
          read: function(){

              var newSum = 0;              
              for(var m in pmM)
              {
                  newSum += pmM[m].wage();                  
              } 
              if(newSum < 5){

                pmKO.allowMH(false);
                return;
              }
                pmKO.allowMH(true);                 
                pmKO.cVal(newSum);
                pmKO.mVal(newSum);
                pmKO.phType('MH'); 
                return formatMoney(newSum);        
              }, owner:pmKO});
        
        pmKO.setCVal = ko.computed({
            read:function(){
              koCalls.count('CVAL','read');   ////trackinging ko calls  
              if(pmKO.cVal()<25){pmKO.cVal(25)} 

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
                    if(pmKO.allowMH()){
                       pmKO.phVal(pmKO.mVal());                     
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

       var lastSP = [pmP['spTYRC'].added(),pmP['spADB'].added(),pmP['spB2000'].added()];

       pmKO.watchSpouseSPR = ko.computed(function(){
            if(pmP['spSPR'].added())
             {
                pmP['spWHL'].added(false);
                lastSP = [pmP['spTYRC'].added(),pmP['spADB'].added(),pmP['spB2000'].added()];
             }
             else
             {

              for(i=0;i<lastSP.length;i++)
              {
                if(lastSP[i]==1)
                {
                  pmP['spWHL'].added(true);
                  return;
                }
              }

               pmP['spTYRC'].added(lastSP[0]);
               pmP['spADB'].added(lastSP[1]);
               pmP['spB2000'].added(lastSP[2]);
             }
         },pmKO);


        pmKO.watchSpouseWHL = ko.computed(function(){
            if(pmP['spWHL'].added())
             {
               pmP['spSPR'].added(false);
               pmP['spTYRC'].added(lastSP[0]);
               pmP['spADB'].added(lastSP[1]); 
               pmP['spB2000'].added(lastSP[2]);               
             }
             else
             {

               lastSP = [pmP['spTYRC'].added(),pmP['spADB'].added(),pmP['spB2000'].added()];
             }
         },pmKO);
   

        
        pmKO.showYRL = ko.observable(getPowerHour.globals.showDefaults[0]);
        pmKO.showMBD = ko.observable(getPowerHour.globals.showDefaults[1]);
        pmKO.showWKL = ko.observable(getPowerHour.globals.showDefaults[2]);
        pmKO.showDLY = ko.observable(getPowerHour.globals.showDefaults[3]);


        pmKO.useConcept =  ko.observable(getPowerHour.globals.startConcept);

        pmKO.totalUsed = ko.observable();

        pmKO.sumTotals = ko.computed(function(){
          var totalAHP = 0;
          var totalALP = 0;
          for(var product in pmP)
          {
              if((pmP[product].allowed())&&(pmP[product].added()))
              {
                if((pmP[product].owner != 'sp')||(pmP[product].lbl == 'SPR')||(!pmP['spSPR'].added()))
                {
                  if(pmP[product].ALHP == 'ALP')
                  {
                    totalALP += pmP[product].YRL();
                  }
                  else
                  {
                    totalAHP += pmP[product].MBD()*12;
                  }

                }
              }
              pmKO.totalUsed(returnVals.YRL(totalAHP+totalALP));
          }

          }, pmKO);

        pmKO.showTotals = ko.computed(function(){

          var total = 0;
          if(pmKO.useConcept()=='D')
          { 
            total  = 365*pmKO.dtype();
          }
          else
          {
            total  = 52*pmKO.phVal();
          }

          var totalVals = returnVals.YRL(total);
          var diffVals = returnVals.YRL(totalVals.YRL - pmKO.totalUsed().YRL)

          countT('YRL','diff',diffVals.YRL);
          countT('MBD','diff',diffVals.MBD);
          countT('WKL','diff',diffVals.WKL);
          countT('DLY','diff',diffVals.DLY);

          countT('YRL','used',pmKO.totalUsed().YRL);
          countT('MBD','used',pmKO.totalUsed().MBD);
          countT('WKL','used',pmKO.totalUsed().WKL);
          countT('DLY','used',pmKO.totalUsed().DLY);

          countT('YRL','total',totalVals.YRL);
          countT('MBD','total',totalVals.MBD);
          countT('WKL','total',totalVals.WKL);
          countT('DLY','total',totalVals.DLY);

        });






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
        pmP = {};
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
                        var id = pVals.members[m].id;                    
                          pmM[id] = new getPowerHour.policyHolderModelKO(id);            

                          for(var attr in pVals.members[m])
                                {
                                    if(pmM[id].hasOwnProperty(attr))
                                    {
                                        pmM[id][attr](pVals.members[m][attr])
                                    }
                                    else
                                    {    
                                        pmM[id][attr] = ko.observable( pVals.members[m][attr] ).extend({logChange: attr});                                            
                                    }                                                                     
                                }  
                          pmM[id].addComputed();                       
                     } ///// end members initializations 
                break;
                case 'products':     /////////////// Declare and populate Products Array Attributes
                  for(var p in pVals.products)
                    { 
                      var id = pVals.products[p]['owner']+pVals.products[p]['lbl'];                      
                      pmP[id] = new getPowerHour.policyProductModelKO();
                      for(var attr in pVals.products[p])
                        {
                          if((attr == 'lbl' ) || (attr == 'owner' ))
                          {
                            pmP[id][attr]=pVals.products[p][attr];
                          }
                          else if(pmP[id].hasOwnProperty(attr))
                          {
                            pmP[id][attr](pVals.products[p][attr])
                          }
                          else
                          {
                            pmP[id][attr]=ko.observable(pVals.products[p][attr]).extend({logChange: id+' - ' + attr}); 
                          }
                          console.log(attr);
                                                    
                        } 

                      //// initialize functions
                      pmP[id].init(id);                                               
                     } ///// end product initializations

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

            pm.init(); //initialize policy model KO functions      
          }

 
    // The Logic Order - init, init-computed - if(new){format new}
    if(getPowerHour.globals.current_policy == -1){getPowerHour.globals.loadingNew = true};
    
    pApp.init(); //initialize policy app, populate all values, add all member, policy, and error KO fxns 
    

    if(getPowerHour.globals.loadingNew){pm.isNew()};
    
    getPowerHour.policyjQ(); //add policy app specific jQuery functions

   }



/* The declarations and initializations */
var pm;  /// the policy model
var pmE; /// the policy error array
var pmM; /// the policy member array
var pmP; /// the policy products array

var newPMKO = new getPowerHour.policyApp(newPolicy);
ko.applyBindings(newPMKO); 











