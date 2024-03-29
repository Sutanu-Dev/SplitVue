import { LightningElement, wire } from 'lwc';
import fetchGroupMembers from '@salesforce/apex/splitVue_singleGroupDetailsController.fetchGroupMembers';
import deleteGroupMember from '@salesforce/apex/splitVue_singleGroupDetailsController.deleteGroupMember';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class SplitVue_seeRemoveGroupMembers extends LightningElement {
    
    urlParam;
    refreshMemberList;
    groupMembers=[];
    removeMemberPrompt = false;
    memberName;
    memberId;
    hasData = false;
    test = null;
    
    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        console.log("recId From group Member : "+newURL.get('groupRecId'))
        this.urlParam = newURL.get('groupRecId');

       
        
    }
    
    @wire(fetchGroupMembers,({GroupId : "$urlParam"}))
    groupMemberDetails(result){

        this.refreshMemberList = result;

        let data = result.data;
        let error = result.error;

        if(data){

            this.hasData = data.length > 0 ? true : false;

            this.groupMembers = data;
            console.log("group members data : ",data);
        } else if(error){
            console.error("group members error : ",error);
        }
        
        
        
    }

    removeMemberHanlder(event){
        let recId = event.target.getAttribute("data-recid");
        this.memberId = recId;

        let recName = event.target.getAttribute("data-label");
        this.memberName = recName;

        this.removeMemberPrompt =true;
    }

    cancelRemove(){
        this.removeMemberPrompt = false;
    }

     removeMember(){

        deleteGroupMember({MemberId : this.memberId})
        .then(result =>{

            this.removeMemberPrompt = false;

            if(result.includes("Has Been Removed From The Group")){

                this.dispatchEvent(new ShowToastEvent({
                    title : "sucess!",
                    message : result,
                    variant : "success"
    
                }))
            } else {

                this.dispatchEvent(new ShowToastEvent({
                    title : "error!",
                    message : result,
                    variant : "error"
    
                }))

            }
            

            return refreshApex(this.refreshMemberList);

        })
        .catch(error => {

        })

    }


}