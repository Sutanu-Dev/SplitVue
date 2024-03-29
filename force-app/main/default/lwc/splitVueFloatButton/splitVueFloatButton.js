import { LightningElement, track, wire } from 'lwc';
import createGroup from '@salesforce/apex/splitVueCreateGroup.createGroup';
// import splitVue_refreshGrpListMsg from '@salesforce/messageChannel/splitVue_refreshGrpListMsg__c'
// import { MessageContext, publish } from 'lightning/messageService';

export default class SplitVueFloatButton extends LightningElement {

    @track showModal = false;
    GroupName;
    refreshGroupList = false;

    openModal() {    
        this.showModal = true;
    }
    closeModal() {    
        this.showModal = false;
    }

    handleGroupName(event){
        this.GroupName = event.target.value;
    }
    //calling the messageContext method
    //@wire(MessageContext) messageContext;

    //calling Apex Method through button click
    handleCreateGroup(event){
        createGroup({GroupNames : this.GroupName})
        .then(result => {
            // console.log("result : "+JSON.stringify(result));
            this.showModal = false;
            // this.refreshGroupList = true;

            // let payload = {value : this.refreshGroupList};
            // publish(this.messageContext, splitVue_refreshGrpListMsg, payload);
            // console.log("checking : "+ this.refreshGroupList);
        })
        .catch(error => {
            // console.error("error : "+JSON.stringify(error));
        })
    }
}