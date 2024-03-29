import { LightningElement, track, wire } from 'lwc';
import getPercentage from '@salesforce/apex/splitVue_GroupInfoController.getPercentage';
// import {getRecord} from '@lightning/uiRecordApi';
// import Percentage from '@salesforce/schema/Group__c.Amount_Paid_Percent__c';

export default class SplitVue_SettleUpPageHeader extends LightningElement {

    counter = 0;
    elemnt;
    _rendered = false;

    progressCircle;

    percentage = 0;
    groupId = null;
    
    
    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        // console.log("id ==> :"+newURL.get('groupRecId'));
        this.groupId = newURL.get('groupRecId');
        //console.log("groupId from settle up page" + this.groupId);
    }

    renderedCallback(){
        

        if (this._rendered) {
            return;
        }
        this._rendered = true;
    
        const id = this.refs.gradientcolor.id;
        this.refs.circle.setAttribute('stroke', 'url(#' + id + ')');

        
        //this.calLoaing();
        
    }

    

    calLoaing(){
        let circle = this.template.querySelector(".progress");
        let loadingPer = this.template.querySelector(".number");

        let j=0;
        let fakeLoad = [];
        for(let i = 0; i<=this.percentage; i++){
            
            fakeLoad.push(i);
        };
        // console.log("fakeLoad"+fakeLoad);
        let circumference = circle.getTotalLength();

        const interval = setInterval(() => {
            circle.style.strokeDashoffset = circumference - (fakeLoad[j] / 100) * circumference;
            loadingPer.innerHTML = fakeLoad[j] + "%";
            j++
            if(j== fakeLoad.length){
                clearInterval(interval);
                loadingPer.innerHTML = fakeLoad.length + "%";
            }
        },50);
        
    }
    
    
    handlePercentage(event){
        this.percentage = event.detail;
        console.log("handlePercentage : "+ this.percentage);

        this.calLoaing();
    }

    @wire(getPercentage, {GroupId : "$groupId"})fetchedResult(result){

        let data = result.data;
        let error = result.error;

        if(data){
            console.log("percentahe data :: "+ data);
            this.percentage = data;

            this.calLoaing();
            
            
        } else if(error){
            console.error("percentahe error :: " + error);
        }
    }
    
}