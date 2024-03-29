import { LightningElement, api, wire } from 'lwc';
import groupCover from '@salesforce/resourceUrl/groupCover';
import profilePicture from '@salesforce/resourceUrl/profilePicture';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import splitVue_GrpDetailsPageMsgChnl from '@salesforce/messageChannel/splitVue_GrpDetailsPageMsgChnl__c';
import finalGroupCover from '@salesforce/resourceUrl/finalGroupCover';

export default class SplitVue_groupDetailsPageCover extends LightningElement {
    coverImageUrl = groupCover;
    profileImageUrl= profilePicture;
    subscription = null;
    GroupName;
    finalCoverImage = finalGroupCover;

    @wire(MessageContext)messageContext;

    connectedCallback(){
        this.handleSubscribe();
        // console.log("grp name from message channel : "+ this.GroupName);
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