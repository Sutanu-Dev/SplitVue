import { LightningElement, api, wire } from 'lwc';
import fetchGroupMembers from '@salesforce/apex/splitVue_singleGroupDetailsController.fetchGroupMembers';
import searchGroupMembers from '@salesforce/apex/splitVue_singleGroupDetailsController.searchGroupMembers';
import { refreshApex } from '@salesforce/apex';
import updateGroupItemWithSharedUsers from '@salesforce/apex/splitVueGroupItemController.updateGroupItemWithSharedUsers';

export default class SplitVue_editGroupItem extends LightningElement {
    //event variables
    closeModalEvent;

    // OpenForm = false;
    urlParam;
    userList;
    groupMembers;
    //variables for Price field
    ItemPrice = 0;
    //variables for Paid By field 
    userSelected = false;
    selectedUser = null;
    showDropDown = false;
    PaidByMemberId = "";
    //variable for Item Name field
    ItemName ="";
    // variables for Shared With field
    memberName;
    memberId;
    sharedWithMembers = [];
    refreshSharedWithMembers;
    SelectIndividual = false;
    selectedValue = "Equally";
    sharedWithAllMembers = [];

    //group item variables 
    @api grpItemId;
    @api itemPriceValue;
    @api itemPaidUserValue;
    @api itemLableValue;
    @api itemPaidUserIdValue;
    
    @api refreshGi = [];

    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        // console.log("id ==> :"+newURL.get('groupRecId'));
        this.urlParam = newURL.get('groupRecId');
        this.selectedUser = this.itemPaidUserValue;
        this.userSelected = true;
        this.ItemName = this.itemLableValue;
        this.ItemPrice = this.itemPriceValue;
        this.PaidByMemberId = this.itemPaidUserIdValue;
    }

    // closeAddExpenseForm(){
    //     this.OpenForm = false;

    //     //refresh all the variables
    //     this.ItemPrice = 0;
    //     this.ItemName = null;
    //     this.selectedUser = null;
    //     this.PaidByMemberId = "";
    //     this.sharedWithMembers = [];
    //     this.userSelected = false;
    //     this.SelectIndividual = false;
    // }

    // ......code for Paid By Field......................

    handleDropDown(event){
        let UserName = event.target.value;

        searchGroupMembers({GroupId : this.urlParam , SearchKey: UserName})
        .then(data => {
            console.log("addEx : ", data);
            this.userList = data;
            this.showDropDown = true;
        })
        .catch(error => {

        })
    
    }

    handleRemoveSelectUser(){
        this.userSelected = false;
    }

    // hideDropDown(){
    //     this.showDropDown = false;
    // }

    getSelectedUser(event){
        
        this.PaidByMemberId = event.target.getAttribute("data-userid");
        this.selectedUser = event.target.getAttribute("data-label");
        this.userSelected = this.selectedUser !== null ? true : false;

        this.showDropDown = false;
        
    }

    // -----------code for Price field-------------------
    getPriceHandler(event){
        this.ItemPrice = event.target.value;
    }

    


    // code for Item Name field

    handleItemName(event){
        this.ItemName = event.target.value;
    }


    // -----------Code For Shared With Field -------------------------------

    @wire(fetchGroupMembers, {GroupId : "$urlParam"})
    groupMember(result){
        this.refreshSharedWithMembers = result;
        let data = result.data;
        let error = result.error;

        if(data){
            
            this.groupMembers = data;

            this.groupMembers.map(item => {
                this.sharedWithAllMembers.push(item.Group_Member__c);
            })

        } else if(error){

        }
    }

    handleAddButtonClick(event){
        this.memberName = event.target.getAttribute("data-label");
        this.memberId = event.target.getAttribute("data-id");
        this.sharedWithMembers.push(this.memberId);
        // this.sharedWithMembers.push({Id : this.memberId , Value : this.memberName});
        console.log("this.sharedWithMembers :" + this.sharedWithMembers);
        var buttonElements = this.template.querySelectorAll("lightning-button-icon-stateful");
        
        buttonElements.forEach(function(button){
            

            if(button.dataset.id == this.memberId){
                
                button.disabled = true;
                button.iconName = button.iconName === "utility:add" ? "utility:check" : "utility:add"  ;
                button.selected = true ; //!button.selected;
            } 
        }, this);
        
    }

    handleSelection(event){
        this.selectedValue = event.target.value;
        
        if(this.selectedValue === "Equally"){
            this.SelectIndividual = false;

            

        } else if(this.selectedValue === "Individual"){
            this.SelectIndividual = true;

        } 
    }

    
    closeGroupItemEditModalhandler(){
        
        const closeModalEvent = new CustomEvent("cancelclick", {detail: false});
        this.dispatchEvent(closeModalEvent);
        
    }

    editGroupItemHandler(){

        // console.log("this.grpItemId " + this.grpItemId);
        // console.log("this.ItemPrice " + this.ItemPrice);

        // console.log("this.ItemName " + this.ItemName);

        // console.log("this.PaidByMemberId " + this.PaidByMemberId);

        // console.log("this.sharedWithMembers " + this.sharedWithMembers);

        
        if(this.selectedValue === "Individual"){

            updateGroupItemWithSharedUsers({GroupItemId : this.grpItemId, GroupId : this.urlParam, 
                ItemPrice : this.ItemPrice, ItemName : this.ItemName, PaidByUserId: this.PaidByMemberId, SharedUsers: this.sharedWithMembers})
                .then(data => {

                    console.log("abar data" ,data);
                    
                    const closeModalEvent = new CustomEvent("cancelclick", {detail: false});
                    this.dispatchEvent(closeModalEvent);
                    
                    return refreshApex(this.refreshGi);
                })
                .catch(error =>{
    
                })
        } else if(this.selectedValue === "Equally"){

            updateGroupItemWithSharedUsers({GroupItemId : this.grpItemId, GroupId : this.urlParam, 
                ItemPrice : this.ItemPrice, ItemName : this.ItemName, PaidByUserId: this.PaidByMemberId, SharedUsers: this.sharedWithAllMembers})
                .then(data => {

                    console.log("abar data2" ,data);
                    
                    const closeModalEvent = new CustomEvent("cancelclick", {detail: false});
                    this.dispatchEvent(closeModalEvent);
                    
                    return refreshApex(this.refreshGi);
                })
                .catch(error =>{
    
                })
        }
        
    }
}