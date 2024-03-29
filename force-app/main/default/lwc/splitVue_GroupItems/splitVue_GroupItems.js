import { LightningElement, wire } from 'lwc';
import fetchGroupItems from '@salesforce/apex/splitVueGroupItemController.fetchGroupItems';
import deleteGroupItem from '@salesforce/apex/splitVueGroupItemController.deleteGroupItem';
import Warning from '@salesforce/resourceUrl/warning';
import {refreshApex} from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class SplitVue_GroupItems extends LightningElement {
    

    groupId;
    GroupItems;
    warningImage =Warning;
    refreshGroupItems;

    // delete modal button variables
    openGroupItemDeleteModal = false;
    groupItemLabel;
    groupItemId;
    catchDeleteException;
    deleteGroupItemLWCError;

    //edit modal button variables
    openGroupItemEditModal = false;

    //variables to send to child
    
    itmPrice;
    itmPaidUser;
    itmLabel;
    itmPaidUserId;
    

    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        // console.log("id ==> :"+newURL.get('groupRecId'));
        this.groupId = newURL.get('groupRecId');
        
    }

    handleSectionToggle(){

    }

    @wire(fetchGroupItems, {GroupId : "$groupId"})fetchedGroupItems(result){

        this.refreshGroupItems = result;
        let data = result.data;
        let error = result.error;

        if(data){
            // this.GroupItems = data;
            console.log("groupItems : ",data);
            //getting the result with additional trimmed date data
            this.GroupItems = data.map(gItem => ({
                Id: gItem.Id,
                Name: gItem.Name,
                Price: gItem.Price__c,
                PaidByUser : gItem.Paid_By__r.Name,
                PaidByUserId: gItem.Paid_By__r.Id,
                Date: this.getDate(gItem.CreatedDate),
                ItemShared : gItem.Item_Shared_Users__r ? true : false,
                SharedUsers : gItem.Item_Shared_Users__r ? this.getItemSharedUsers(gItem.Item_Shared_Users__r) : "Item Is Not Shared"
            }));


        } else if(error){
            console.error("group Items error : ",error);
        }
    }
    //helper function to get the date from dateTime value
    getDate(date) {
        const dateAndTime = date.split("T");
        return dateAndTime[0];
    }

    //helper function to get the list of item shared users
    getItemSharedUsers(Records){
        let userList = [];
        
        Records.map(item => {

            if(item.CUser__r){
                
                userList.push(item.CUser__r);                    
            }            
            
        })

        return userList;
    }

    // ........code for DELETE GROUP ITEM Modal....................

    handleGroupItemDeleteModal(event){
        
        
        this.groupItemLabel = event.currentTarget.getAttribute("data-groupitemlabel");
        this.groupItemId    = event.currentTarget.getAttribute("data-groupitemid");
        this.openGroupItemDeleteModal = true;
        
    }

    closeGroupItemDeleteModalhandler(){
        this.openGroupItemDeleteModal = false;
    }

    deleteGroupItemHandler(){
        deleteGroupItem({GroupItemId : this.groupItemId, GroupItemName : this.groupItemLabel, 
            GroupId : this.groupId})
            .then(data => {

                if(data.includes("Has Been Removed From")){

                    this.dispatchEvent(new ShowToastEvent({
                        title : "",
                        message : data,
                        variant : "success"
        
                    }))
                } else if(data.includes("Item Couldn't Be Deleted")){

                    this.dispatchEvent(new ShowToastEvent({
                        title : "Sorry!",
                        message : data,
                        variant : "error"
        
                    }))
                } else if(data.includes("Exception Occured")){
                    this.catchDeleteException = data;
                }
                this.openGroupItemDeleteModal = false;
                return refreshApex(this.refreshGroupItems);
            })
            .catch(error => {
                this.deleteGroupItemLWCError = error;
            })
    }

    // ........code for EDIT GROUP ITEM Modal....................

    handleGroupItemEditModal(event){

        this.groupItemId = event.currentTarget.getAttribute("data-groupitemid");
        this.itmPrice = event.currentTarget.dataset.itemprice;
        this.itmPaidUser = event.currentTarget.dataset.paibyuser;
        this.itmLabel = event.currentTarget.dataset.groupitemlabel;
        this.itmPaidUserId = event.currentTarget.dataset.paidbyuserid;

        
        this.openGroupItemEditModal = true;
        
        
        // return refreshApex(this.refreshGroupItems);
        
    }

    closeEditModalFromChild(event){
        this.openGroupItemEditModal = event.detail;
    }
}