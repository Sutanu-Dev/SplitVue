import { LightningElement, wire } from 'lwc';
import fetchSettleUpCalculation from '@salesforce/apex/splitVue_SettleUpPageController.fetchSettleUpCalculation';
import updatePaidAmount from '@salesforce/apex/splitVue_SettleUpPageController.updatePaidAmount';
import {refreshApex} from '@salesforce/apex';

export default class SplitVue_settleUpComponent extends LightningElement {

    groupId;
    // borrowedUserListWithMap;
    // keySets;
    recordsWithMapedData = [];
    totalSum;
    settledUp = false;
    remainingAmount;
    showPayModal = false;
    paidAmount = 0;
    recordId;
    currentElement;
    refreshSettleUpCalculation;
    settledUp = false;
    percentage = 0;

    @wire(fetchSettleUpCalculation,{GroupId : "$groupId"})fetchh(result){

        this.refreshSettleUpCalculation = result;

        let data = result.data;
        let error = result.error;

        if(data){
            console.log("fetchSettleUpCalculation data",data);
            
            let keySets = Object.keys(data);
            let records = [];
            let totalAmount = 0;

            for(let i=0; i < keySets.length; i++){
                
                let Item = data[keySets[i]];

                totalAmount = this.getTotalAmount(Item) + totalAmount;

                let myObject = {
                    Id: Item[0].Borrowed__c, 
                    Name :Item[0].Borrowed__r.Name, 
                    myArray : this.getAmmountWithPaidUser(Item)
                };
            
                records.push(myObject);
        }
            this.recordsWithMapedData = [...records];
            this.totalSum = totalAmount;
            console.log("this.totalSum ::" + this.totalSum);
            // console.log("recordsWithMapedData ", this.recordsWithMapedData);
            // console.log("recordsWithMapedData ", this.recordsWithMapedData[0].myArray[0].PaidBy);


        } else if(error){
            console.log("fetchSettleUpCalculation error", error);
        }
    }

    getAmmountWithPaidUser(array){
            

           let ArrayOfObject = array.map(item => ({
        
               PaidBy: item.Paid__r.Name, 
               PaidById : item.Paid__c,
               Amount : Math.ceil(item.Amount__c), 
               RemainingAmount : item.Amounts_Remained__c,
               Id : item.Id,
               Settled : item.Settled_Up__c
                                       
            }))
            return ArrayOfObject;
    }

    getTotalAmount(array){

        let amount = 0;
        array.map(item => {
            amount = Math.ceil(item.Amount__c) + amount;
        })
        return amount;
    }

    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        // console.log("id ==> :"+newURL.get('groupRecId'));
        this.groupId = newURL.get('groupRecId');
        //console.log("groupId from settle up page" + this.groupId);
    }

    // handleSectionToggle(){
    //     let elm = this.template.querySelector(".accordian-background");
    //     // elm.style.background = "red";
    //     elm.classList.add("test");
    // }
    handleSettleUp(event){
        this.currentElement = event.currentTarget;
        
    }

    handlePay(event){
        this.remainingAmount = event.target.dataset.remamount;
        this.paidAmount = this.remainingAmount;

        this.recordId = event.target.dataset.id;
        // this.settledUp = event.target.dataset.settled;
        this.showPayModal = true;
    }

    handleInput(event){
        let pAmount = 0; 
        pAmount = event.target.value;
        //let attributePAmount = event.target.getAttribute("value");
        
        if(pAmount !== 0){
            this.paidAmount = pAmount;
        } 
        
        //console.log("valueTest :: "+ this.paidAmount);
    }
    
    hidePayModal(){
        
        this.showPayModal = false;
        
    }

    updatePaidAmount(){
        updatePaidAmount({PaidAmount : this.paidAmount, RecordId: this.recordId, GroupId : this.groupId, TotalAmountToBePaid : this.totalSum})
        .then(data => {
            console.log(data);
            this.percentage = data;
            console.log("percentage : "+ this.percentage);
            this.sendPercentage();
            this.showPayModal = false;
            return refreshApex(this.refreshSettleUpCalculation);
            
        })
        .catch(error => {
            console.error("error from updatePaidAmount apex method : " , error);
        })
    }

    sendPercentage(){
        const percentEvent = new CustomEvent("getpercentage", {
            detail: this.percentage
        });

        this.dispatchEvent(percentEvent);
    }
}