
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
         ppKO.MBD = ko.observable(0).extend({logChange: pId + ' MBD '}); 
         ppKO.YRL = ko.observable(0).extend({logChange: pId + ' YRL '}); 
         ppKO.WKL = ko.observable(0).extend({logChange: pId + ' WKL '}); 
         ppKO.COV = ko.observable(0).extend({logChange: pId + ' COV '}); 

         pmE.initError('MBD',pId);
         pmE.initError('YRL',pId);
         pmE.initError('WKL',pId);
         pmE.initError('COV',pId);


         ppKO.allowed = ko.observable(true);
         ppKO.lastChanged = "COV";

         ////////// the unformated values
         ppKO.uMBD = 0; 
         ppKO.uYRL = 0;
         ppKO.uWKL = 0;
         ppKO.uCOV = 0;
         ppKO.ratio = ko.observable(0).extend({logChange: pId + ' RATIO '}); 
         ppKO.ogWage = 0;

         ppKO.resetProductValues = function()
              {
                  ppKO.uMBD = 0;
                  ppKO.ratio = 0;
                  ppKO.uWKL = 0;
                  ppKO.uYRL = 0;
                  ppKO.uCOV = 0;
                  ppKO.lastChanged = "COV";
              }

        ppKO.addComputed = function()
        { 
           

          ppKO.frmtCOV = ko.computed({ 
              read:function(){           

                var newCOV = validFloat(ppKO.COV(),false); 
                if(!newCOV[0]){ return;}
                if(!minmaxCheck('TYR',newCOV[1])){return};
        
                  ppKO.uCOV = newCOV[1];
                  formatMoney(newCOV[1])
                  ppKO.COV(ppKO.uCOV );                  
             
                koCalls.count('frmtCOV - read',ppKO.lbl); 
               },
               write:function(val)
               {   
                  koCalls.count(val +'  frmtCOV - write ',ppKO.lbl); 
                  ppKO.lastChanged = "COV"; 
                  return val;
               }
              }, ppKO);

        
        ppKO.frmtYRL = ko.computed({ 
              read:function(){
                koCalls.count('  frmtYRL - read ',ppKO.lbl); 
               },
               write:function(val)
               {             
                  koCalls.count(val +'  frmtYRL - write ',ppKO.lbl); 
               }
              }, ppKO);


        ppKO.frmtMBD = ko.computed({ 
              read:function(){
                koCalls.count('  frmtMBD - read ',ppKO.lbl); 
               },
               write:function(val)
               {             
                  koCalls.count(val +'  frmtMBD - write ',ppKO.lbl); 
               }
              }, ppKO);

        
        ppKO.frmtWKL = ko.computed({ 
              read:function(){
                   koCalls.count('  frmtWKL- read ',ppKO.lbl); 
               },
               write:function(val)
               {             
                  koCalls.count(val +'  frmtWKL - write ',ppKO.lbl); 
               }
              }, ppKO);

       }
      ppKO.TYRFXNS = function()
      {
        var TYRavailableDUR=["6 Months","1 Year","1.5 Years","2 Years","2.5 Years","3 Years","3.5 Years","4 Years","4.5 Years","5 Years","6 Years"]
        ppKO.ogDur = 1;
        getTYRCov(0);

        ppKO.watchWages = ko.computed(function(){         

            getTYRCov(pmM[ppKO.owner].wage_uf());

            }, ppKO); 

        ppKO.changeDur = ko.computed(function(){ 
            var newDur = ppKO.DUR()/ppKO.ogDur;   
              ppKO.uCOV *= newDur;
              ppKO.uYRL *= newDur;
              ppKO.uMBD *= newDur;
              ppKO.uWKL *= newDur;
              ppKO.COV(ppKO.uCOV);
              ppKO.YRL(ppKO.uYRL);
              ppKO.MBD(ppKO.uMBD);
              ppKO.WKL(ppKO.uWKL);
              ppKO.ogDur = ppKO.DUR();
              }, ppKO); 

        function getTYRCov()
        {
             ppKO.uCOV = pmM[ppKO.owner].wage_uf()*1920;
             ppKO.COV(ppKO.uCOV);
        }

    }
      ppKO.A71FXNS = function()
      {

        getTYRCov(0);
        ppKO.watchWages = ko.computed(function(){         

            getTYRCov(pmM[ppKO.owner].wage_uf());

            }, ppKO); 

        function getTYRCov()
        {
             ppKO.uCOV = pmM[ppKO.owner].wage_uf()*1920;
             ppKO.COV(ppKO.uCOV);
        }
        ppKO.changeTYRDuration = ko.computed(function(){         

            getTYRCov(pmM[ppKO.owner].wage_uf());

            }, ppKO); 

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
                        console.log(pmP[p].lbl)
                         if(pmP[p].lbl == 'TYR'){ 
                         pmP[p].TYRFXNS();}
                         pmP[p].addComputed(); }
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
                      pmP[product].allowed(false);
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
  
  


 getPowerHour.policyjQ()
   }



/* The declarations and initializations */
var pmE; /// the policy error array
var pmM; /// the policy  member array
var pmP; /// the policy products array
var newPMKO = new getPowerHour.policyModelKO(newPolicy);
//ko.applyBindings(pmE); 
ko.applyBindings(newPMKO); 











