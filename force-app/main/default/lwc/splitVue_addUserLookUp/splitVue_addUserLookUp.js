import { LightningElement, wire } from 'lwc';
import fetchUserList from '@salesforce/apex/splitVue_controllerClass.fetchUserList';
import createGroupMembers from '@salesforce/apex/splitVue_controllerClass.createGroupMembers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const Delay = 300 ; //miliseconds

export default class SplitVue_addUserLookUp extends LightningElement {

    SearchKey;//variable being passed to Apex
    hasResult;//boolean
    searchOutput;//data is received in this variable from Apex
    selectedRecords = [];//all the data selected from search result are stored here
    delayTimeout;
    // userIds = [];
    grpIdUrlParam;
    stringIds;
    userWithInitials;
    showErrorPopUp = false;
    errorPopUpResult;
    modalPopUpLWCError;

    

    //onloaing the document group Id from the page link is being fetched
    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        console.log("id ==> :"+newURL.get('groupRecId'));
        this.grpIdUrlParam = newURL.get('groupRecId');
    }

    //user_Groups record creation on click of add member button
    addMemberHandler(event){
        createGroupMembers({GroupId : this.grpIdUrlParam , UserIds : this.selectedRecords})
        .then(result =>{
            console.log("create Group member data :",result);

            //show toast Message based on result received from Apex Code
            if(result.includes("Been Added")){
                
                this.dispatchEvent(new ShowToastEvent({
                    title: "Success !",
                    message: result,
                    variant: "success"
                }));


            } else {
                this.showErrorPopUp = true;
                this.errorPopUpResult = result;

                this.dispatchEvent(new ShowToastEvent({
                    title: "Sorry !",
                    message: "Members Couldn't Be Added.",
                    variant: "error"
                }));
            }
        })
        .catch(error =>{
            console.error("couldn't cearte group members :",error);
            this.modalPopUpLWCError = "Lightning Web Component Error :" + error;
        })
    }

    //close the error pop up modal
    closeModal(){
        this.showErrorPopUp = false;
    }

    //for fetching the search result data for adding group members
    @wire(fetchUserList, {searchKey : '$SearchKey'})
    searchResult({data,error}){
        if(data){
            console.log("User List Data :" ,data);
            this.hasResult = data.length > 0 ? true : false;
            this.searchOutput = data;
            
            //getting the result with additional name initials data
            this.userWithInitials = data.map(user => ({
                Id: user.Id,
                Name: user.Name,
                Initials: this.getNameInitials(user.Name)
            }));

            console.log("userWithInitials : ",this.userWithInitials);
            
        } else if(error){
            console.error("error from fetchUserList : " + error);
        }
    }
    //helper function to get the data in userWithInitials variable
    getNameInitials(name) {
        const words = name.split(" ");
        return words.map(word => word[0]).join("");
    }

    //taking the value from search input
    changeHandler(event){
        clearTimeout(this.delayTimeout);
        let Value = event.target.value;
        this.SearchKey = Value;
        this.delayTimeout = setTimeout(() => {
            this.SearchKey = Value ;
        }, Delay);
    }
    //upon clicking the search result data, storing the value in a collection and--- 
    //--showing in the pill container
    //then getting the user ids and storing in a collection variable  
    clickHandler(event){
        let recId = event.target.getAttribute("data-recid");
        console.log("user rec Id : "+ recId);

        if(this.validateDuplicate(recId)){
            let user = this.searchOutput.find(currItem => currItem.Id === recId );

            let pill = {
                // type : "icon",
                // label : user.Name,
                // name : recId,
                // iconName : "standard:avatar",
                // alternativeText : user.Name
                type: 'avatar',
                label: user.Name,
                name: recId,
                src: 'https://cdn1.vectorstock.com/i/1000x1000/31/95/user-sign-icon-person-symbol-human-avatar-vector-12693195.jpg',
                fallbackIconName: 'standard:user',
                variant: 'circle',
                alternativeText: user.Name
            }

            this.selectedRecords = [...this.selectedRecords, pill];
            console.log("selected pills :"+JSON.stringify(this.selectedRecords));
            
               
        }

        // this.selectedRecords.map(item => {
        //     this.userIds.push(item.name);
        // })
        // console.log("userIds from add : "+ JSON.stringify(this.userIds));
    }

    //condition to show pill container in the UI
    get showPillContainer(){
        return this.selectedRecords.length > 0 ? true : false;
    }

    //Item is being removed from the pill container
    itemRemoveHandler(event){
        const index = event.detail.index;
        console.log("index : "+ index);
        this.selectedRecords.splice(index , 1);
        console.log("remove Ids :"+ JSON.stringify(this.selectedRecords));
        
        
    }

    //validating if the data already exist before inserting into the pill container
    validateDuplicate(selectedrecord){
        let isValid = true;
      let isRecordAlreadySelected = this.selectedRecords.find(currItem => currItem.name === selectedrecord);

      if(isRecordAlreadySelected){
        isValid = false;
        this.dispatchEvent(new ShowToastEvent({
            title: "Error !",
            message: "This Person is Already Selected",
            variant: "error"
        }));
      } else {
        isValid = true;
      }
        return isValid;
    }
}