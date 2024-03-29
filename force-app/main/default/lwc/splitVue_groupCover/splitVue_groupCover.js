import { LightningElement, api, wire } from 'lwc';
import groupCover from '@salesforce/resourceUrl/groupCover';
import profilePicture from '@salesforce/resourceUrl/profilePicture';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import splitVue_GrpDetailsPageMsgChnl from '@salesforce/messageChannel/splitVue_GrpDetailsPageMsgChnl__c';

export default class SplitVue_groupCover extends LightningElement {
    // GroupCoverImage = splitVue_GroupCoverImage;
    testURLL = "https://images.unsplash.com/photo-1576675047654-8c1fbbc6846a?q=80&w=1836&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    // get backgroundImageStyle() {
    //     return `background-image: url(${splitVue_GroupCoverImage})`;
    // }
    coverImageUrl = groupCover;
    profileImageUrl= profilePicture;
    subscription = null;
    GroupName;

    @wire(MessageContext)messageContext;

    connectedCallback(){
        this.handleSubscribe();
        console.log("grp name from message channel : "+ this.GroupName);
    }

    disconnectedCallback(){
        this.handleUnsubscribe();
    }

    handleSubscribe(){
        if(!this.subscription){

                this.subscription = subscribe(this.messageContext, splitVue_GrpDetailsPageMsgChnl,
                    (parameter) => {
                        this.GroupName = parameter.value;
                    }
                    )
        }
    }

    handleUnsubscribe(){
        unsubscribe(this.subscription);
        this.subscription = null;
    }
}