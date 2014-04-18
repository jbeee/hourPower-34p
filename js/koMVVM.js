
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
            console.log('computing '+what+' CALLED by '+who+' ---------------------------------------------------------------------------- total:'+cc.t+'------------------------------------------------------&---'+ cc.Arr[who][what]) 
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
          lastValid: ko.observable(false),
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
    ph.wage_uf = ko.observable(0);
    ph.age_uf = ko.observable(0);

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
                  ph.age_uf (newAge[1]);  
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
               }
              }, ph); 
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
               }
              }, ph); 
        //// format WAGE         
          ph.formatWage = ko.computed({ 
              read:function(){               
                var newWage = validFloat(ph.wage(),false);      
                if(newWage[0])
                 {
                    ph.wage_uf(newWage[1]);
                    if(newWage[1] < 5){
                      ph.allowPH(false)
                    }
                    else{ 
                      ph.allowPH(true);                  
                    }
                    ph.wage(formatMoney(newWage[1]));                    
                    pmE.removeError('Hourly_Wage',ph.mId,newWage[1]);
                 }
                 else
                 {                   
                   pmE.addError('Hourly_Wage',ph.mId,newWage[1],false);
                 };
               },
               write:function(V)
               {
                return V;
               }
              }, ph);
      }  
  }

//////////////////// ***** THE KNOCKOUT MODEL FOR POLICY PRODUCT
getPowerHour.policyProductModelKO = function(pId)
  {
         var ppKO = this;
         ppKO.pId = pId;
          ////////// the unformated values

         ppKO.uCOV=0;
         ppKO.uDUR=ko.observable(1);

         ppKO.MBD = ko.observable(0);
         ppKO.YRL = ko.observable(0);
         ppKO.WKL = ko.observable(0);
         ppKO.COV = ko.observable(0);


         pmE.initError('MBD',pId);
         pmE.initError('YRL',pId);
         pmE.initError('WKL',pId);
         pmE.initError('COV',pId);


         ppKO.allowed = ko.observable(true).extend({logChange: pId + ' allowed '}); 
         ppKO.lastChanged = ko.observable('').extend({logChange: pId + ' last changed '}); 
         ppKO.ratio = ko.observable(1).extend({logChange: pId + ' RATIO '}); 


         ppKO.resetProductValues = function()
              {
                  ppKO.uMBD = 0;
                  ppKO.ratio = 0;
                  ppKO.uWKL = 0;
                  ppKO.uYRL = 0;
                  ppKO.uCOV = 0;
                  ppKO.lastChanged('');
                  ppKO.allowed(true);
              }

        ppKO.initComputed = function()
        { 
          ppKO.setCOV = ko.computed({ 
              read:function(){ 
                var newCOV = ppKO.COV();
                console.log('read COV' + newCOV);   
                countMe(newCOV, ppKO.lbl, ppKO.owner,'COV');
                return formatMoney(newCOV);
               },
               write:function(val)
               { 
                 var newCOV = validFloat(val,true);
                 if(newCOV[0])
                 {
                 console.log('write COV' + newCOV[1]);
                 calculateVals('COV',newCOV[1],'writeCOV');
                 }
               }
              }, ppKO).extend({logChange: pId + ' COV'});


          ppKO.setMBD = ko.computed({ 
              read:function(){                   
                  var newMBD = ppKO.MBD();
                  console.log('read MBD' + newMBD); 
                  countMe(newMBD, ppKO.lbl, ppKO.owner, 'MBD')
                  return formatMoney(newMBD);
               },
               write:function(val)
               { 
                 var newMBD = validFloat(val,true);
                 console.log('write MBD' + newMBD[1]);
                 if(newMBD[0])
                 {                 
                 calculateVals('MBD',newMBD[1],'writeMBD');
                 }
               }
              }, ppKO).extend({logChange: pId + ' MBD'});

          ppKO.setYRL = ko.computed({ 
              read:function(){ 
                  var newYRL = ppKO.YRL();
                  console.log('read YRL' + newYRL); 
                  countMe(newYRL, ppKO.lbl, ppKO.owner, 'YRL')
                  return formatMoney(newYRL);
               },
               write:function(val)
               { 
                 var newYRL = validFloat(val,true);
                 console.log('write YRL' + newYRL[1]);
                 if(newYRL[0])
                 {                 
                 calculateVals('YRL',newYRL[1],'writeYRL');
                 }
               }
              }, ppKO).extend({logChange: pId + ' YRL'});   

          ppKO.setWKL = ko.computed({ 
              read:function(){ 
                  var newWKL = ppKO.WKL();
                  console.log('read WKL' + newWKL); 
                  countMe(newWKL, ppKO.lbl, ppKO.owner, 'WKL')
                  return formatMoney(newWKL);
               },
               write:function(val)
               { 
                 var newWKL = validFloat(val,true);
                 console.log('write WKL' + newWKL[1]);
                 if(newWKL[0])
                 {                 
                 calculateVals('WKL',newWKL[1],'writeWKL');
                 }
               }
              }, ppKO).extend({logChange: pId + ' WKL'}); 

          calculateVals('COV',ppKO.COV(),' init');
       }
      ppKO.TYRFXNS = function()
      {
        ppKO.ogDUR = 1;
        
        pmE.initError('DUR',pId);

        ppKO.setRatio = ko.computed(function(){
          if((pmM[ppKO.owner].gender() == '')||(pmM[ppKO.owner].TU() == '')||(pmM[ppKO.owner].age_uf()== '')){return;} 
          ppKO.ratio(dataArr['TYR'][pmM[ppKO.owner].gender()][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age_uf()]);

        }, ppKO);

        ppKO.watchWages = ko.computed(function(){
              ppKO.uCOV = pmM[ppKO.owner].wage_uf()*1920*ppKO.uDUR;              
            }, ppKO);         

        ppKO.setDur = ko.computed(function(){ 
            ppKO.uDUR(ppKO.DUR()/ppKO.ogDUR);           
            ppKO.ogDUR = ppKO.DUR();
          }, ppKO);

    }
      ppKO.A71FXNS = function()
      {


      }

    ppKO.WHLFXNS = function()
    {      
      ppKO.category = ko.observable().extend({logChange: pId + ' category changed '});
      ppKO.setCat = ko.computed(function(){
        if((pmM[ppKO.owner].gender() == '')||(pmM[ppKO.owner].TU() == '')||(pmM[ppKO.owner].age_uf()== '')){return;}
        for(var i=0;i<defArr['WHL']['categories'].length;i++)
          {
            if(ppKO.COV() <= defArr['WHL']['categories'][i]['max'])            {  
                ppKO.category(defArr['WHL']['categories'][i]['lbl']);         
                ppKO.ratio(dataArr['WHL'][pmM[ppKO.owner].gender()][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age_uf()][i]);               
                return;
            }
          }
       }, ppKO);          
    }

    ppKO.ADBFXNS = function()
    {      
       ppKO.setRatio = ko.computed(function(){ 
        if((pmM[ppKO.owner].gender() == '')||(pmM[ppKO.owner].TU() == '')||(pmM[ppKO.owner].age_uf()== '')){return;}
        for(var i=0;i<dataArr['ADB']['age'].length;i++)
          {
            if(pmM[ppKO.owner].age_uf()<= dataArr['ADB']['age'][i])
            {         
                ppKO.ratio(dataArr['ADB']['ratio'][i]);               
                return;
            }
          }        
        }, ppKO);        
    }
    
    ppKO.SPRFXNS = function()
    {      

     ppKO.setCat = ko.computed(function(){
        if((pmM[ppKO.owner].TU() == '')||(pmM[ppKO.owner].age_uf()== '')){return;}       
          ppKO.ratio(dataArr['SPR'][pmM[ppKO.owner].TU()][pmM[ppKO.owner].age_uf()]);             
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
                  tempCOV = val*ppKO.uDUR();                    
                break;
                case 'YRL':
                  tempCOV = (val*1000)/ppKO.ratio()*ppKO.uDUR();        
                break;
                case 'MBD':
                  tempCOV = ((val*1000)/ppKO.ratio())*12*ppKO.uDUR();
                break; 
                case 'WKL':
                  tempCOV = ((val*1000)/ppKO.ratio())*52*ppKO.uDUR();
                break;
              }
              var chk = minMaxCheck(ppKO.lbl,tempCOV);
              if(chk[0])
                {
                    pmE.removeError(which,ppKO.pId,tempCOV);
                    ppKO.COV(tempCOV);
                    ppKO.uCOV = tempCOV;
                    ppKO.YRL(ppKO.ratio()*tempCOV*(0.001));
                    ppKO.MBD(ppKO.YRL()/12);
                    ppKO.WKL(ppKO.YRL()/52);
                    ppKO.lastChanged(which);
                }
              else
                {
                    pmE.addError(which,ppKO.pId,chk[1],true);
                }
                
              }

  }


/* 
  Knockout Observable Policy model   
*/
getPowerHour.policyModelKO = function(pVals) 
  {
    var pmKO = this;
    pmE = new getPowerHour.inputErrors();
    /*
       Declare all neccessary observable/non-observable variables
       Adds in data from the model sent to the new KO policy model
       All the important stuff
    */
      pmKO.init = function(){  
       
          ///////////////////////////////////// declare all necessary arrays, data, and functions.   
          pmM = {};
          pmP={}; 
          pmKO.hasSpouse = ko.observable().extend({logChange: 'Spouse allowed on policy (has Name or Birthday)'});
          pmKO.cVal_uf = 0; 
          pmP.availableDUR = ko.observableArray([{val:0.5, showVal:'6 Months'},{val:1, showVal:'1 Year'},{val:1.5, showVal:'1.5 years'},{val:2, showVal:'2 years'},{val:2.5, showVal:'2.5 years'},{val:3, showVal:'3 years'},{val:3.5, showVal:'3.5 years'},{val:4, showVal:'4 years'},{val:4.5, showVal:'4.5 years'},{val:5, showVal:'5 years'},{val:6, showVal:'6 years'}]);
          //////////////// Add all properties from the hour power policy data model 
          for(var attr in pVals){               
              switch(attr)
               {                
                case '_id': ///// Check if new policy or old one             
                  pmKO.id = pVals['_id'];
                  pmKO.dateCreated = pVals['dateCreated'];
                  pmKO.state = pVals['state'];
                  pmKO.group = pVals['group'];
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
                            default:
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
                    if(pmKO.hasOwnProperty(attr))
                          {
                              pmKO[attr](newAttrVal)
                          }
                          else
                          {    
                              pmKO[attr] = ko.observable(newAttrVal).extend({logChange: attr});                                             
                          } 
                          console.log(attr+" : "+pmKO[attr]()) 
                break;
              }
            }      
          }

    /* 
      The initialization functions and all declarations 
      specific to the KO hourpower policy sheet
    */
    pmKO.initComputed = function(){

      pmE.initError('Power_Hour','Custom');
      

      pmKO.format_cVAL = ko.computed({
        read:function(){
          koCalls.count('CVAL','read');   ////trackinging ko calls     
          var new_cVal = validFloat(pmKO.cVal(),true);            
          if(new_cVal[0])
              {                                   
                 pmKO.cVal_uf = new_cVal [1];             
                 pmKO.cVal(formatMoney(new_cVal[1]));
                 if(pmKO.phType()){pmKO.phVal(pmKO.cVal_uf)}
                 pmE.removeError('Power_Hour','Custom',new_cVal[1]);                  
              }
             else
              { 
                  pmE.inputErrors.addError('Power_Hour','Custom',new_cVal[1],false);
              }
            },
        write: function(val)
        {
          ///// add checks so that when spouse/policy wages change, total = custom hour if < 30
            /* pmKO.totalWages = ko.computed(function(){
                  console.log('Total wages changed')
                  var tempcVal = 0;      
                  for(var m in pm.members){tempcVal += pm.members[m].wage;}
                  if(tempcVal < 30){tempcVal = 30};
                  pmKO.format_cVAL(tempcVal);
                   }, pmKO);
            */
        }
        ,owner:pmKO });

        pmKO.phTypeCheck = ko.computed(function(){

               if(!pmKO.phType()) /// use policy holder wage as HOUR
                {
                  if(pmM.p.allowPH()){
                     pmKO.phVal(pmM.p.wage_uf());                     
                  }
                  else
                  {
                    pmKO.phVal(pmKO.cVal_uf);
                    pmKO.phType(true); /// use custom value as HOUR
                  }
                   
                }
                else
                {                       
                     pmKO.phVal(pmKO.cVal_uf); 
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

     }

    // put underneath to work - pmKO.showError = ko.computed( function(){ console.log(pmE.errArray['sp_Birthday_Age'].isValid());}, pmKO);

    //If new polciy, update/format data appropriately
        pmKO.isNew  = function(){
            pmKO.dateCreated = new Date();
            pmKO.state = getPowerHour.globals.current_state;
            pmKO.group = getPowerHour.globals.current_group;
            pmKO.synched = true;
            getPowerHour.globals.loadingNew = false;
          }


    // The Logic Order - init, init-computed - if(new){format new}
    if(getPowerHour.globals.current_policy == -1){getPowerHour.globals.loadingNew = true};
    pmKO.init();
    pmKO.initComputed();

    if(getPowerHour.globals.loadingNew){pmKO.isNew()};

    getPowerHour.policyjQ();

   }



/* The declarations and initializations */
var pmE; /// the policy error array
var pmM; /// the policy  member array
var pmP; /// the policy products array
var newPMKO = new getPowerHour.policyModelKO(newPolicy);
//ko.applyBindings(pmE); 
ko.applyBindings(newPMKO); 











