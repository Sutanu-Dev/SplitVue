import { LightningElement, track, wire } from 'lwc';
import createGroup from '@salesforce/apex/splitVueCreateGroup.createGroup';
import fetchGroupData from '@salesforce/apex/splitVue_GroupInfoController.fetchGroupData';
import {NavigationMixin} from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class SplitVue_GroupInfo extends NavigationMixin(LightningElement) {

    hasResult = false;
    GroupInfos ;
    @track UserGroups =[];
    refreshGL;
    groupCreateButton = true;
    showerror = false;

    //-------------------
    //Group button code
    @track showModal = false;
    GroupName = null;
    

    openModal() {    
        this.showModal = true;
        this.groupCreateButton = true;
        this.GroupName = null;
    }
    closeModal() {    
        
        this.groupCreateButton = true;
        this.GroupName = null;
        let section = this.template.querySelector('.slds-modal');
        section.classList.add("onhideanimation");
        setTimeout(() => {
        this.showModal = false;
        section.classList.remove("onhideanimation");

        },500);

    }

    //Assigne group name and check for button enable/disable 
    handleGroupName(event){
        this.GroupName = event.target.value.trim();
        if(this.GroupName.length > 0){
            
            this.groupCreateButton =false;
            
            this.showerror = false;
        } else if(this.GroupName.length === 0){
            
            this.groupCreateButton = true;
            this.showerror = true;    
                
        }
        
    }
    
    handleKeyDown(event){
        let inputValue = event.target.value.trim();
        if (event.which === 32 && inputValue.length === 0) {
            this.showerror = true;
        } else {
            this.showerror = false;
        }
    }

    //calling Apex Method through button click
    handleCreateGroup(event){
        createGroup({GroupNames : this.GroupName})
        .then(result => {
            // console.log("result : "+JSON.stringify(result));
            this.showModal = false;
            
            //disable the Create button again
            
                       
            if (this.showModal === false){
                
                //way to disable Create button
                this.groupCreateButton = true;
                this.GroupName = null;
                
                //showing success toast message
                this.dispatchEvent(new ShowToastEvent({
                    title : "sucess!",
                    message : "Group Has Been Created",
                    variant : "success"

                }))

                //refreshing the group list component to show the updated value 
                return refreshApex(this.refreshGL);

                
            }
            
        })
        .catch(error => {
            // console.error("error : "+JSON.stringify(error));
            console.error("this from error : ",error)
            console.log("you have an error with status code"+ error.status);
            console.log("actuall error "+ error.body);
        })
    }

    //-----------------------
    //Group list code

    handleClick(event){
        let recId = event.target.getAttribute("data-recid");
        console.log("record Id : " + recId);

        if(recId){
            this[NavigationMixin.Navigate]({
            
                type: 'comm__namedPage',
                attributes: {
                    name: 'Group_Details_Page__c'
                },
                state : {
                    'groupRecId': recId
                }    
            })
        }        
    }
     

    @wire(fetchGroupData) receivedGroups(response){
        this.refreshGL = response;
        let data = response.data;
        let error = response.error;
        if(data){
            console.log("data: ", data);
            this.hasResult = data.length > 0 ? true : false;            
            this.GroupInfos = data;
            

        } else if(error){
            console.log("error :", error);
        }
    }


}