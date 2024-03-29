import { LightningElement, api, wire } from 'lwc';
import groupDetailsPage from '@salesforce/apex/splitVue_singleGroupDetailsController.groupDetailsPage';
import { publish, MessageContext } from 'lightning/messageService';
import splitVue_GrpDetailsPageMsgChnl from '@salesforce/messageChannel/splitVue_GrpDetailsPageMsgChnl__c';
import updateGroupName from '@salesforce/apex/splitVue_singleGroupDetailsController.updateGroupName';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchGroupItems from '@salesforce/apex/splitVueGroupItemController.fetchGroupItems';
import {NavigationMixin} from 'lightning/navigation';
import pdflib from "@salesforce/resourceUrl/pdflib";
import { loadScript } from "lightning/platformResourceLoader";
import JSPDF from "@salesforce/resourceUrl/jspdf";
import getContact from '@salesforce/apex/demoPDFClass.getContact';
import splitVuePDFImg from '@salesforce/resourceUrl/splitVuePDFImg';
import groupDetailsCover from '@salesforce/resourceUrl/groupDetailsCover'

export default class SplitVue_GroupDetailsPage extends NavigationMixin(LightningElement) {
    gDetailsCover = groupDetailsCover;
    urlParam;
    groupName;
    groupTotalExpense;
    groupId;
    createdDate;
    closeModal = false;
    updateGroupName;
    closeEditGroupNameModal = false;
    refreshGroupNameData;
    closeMemberListModal = false;
    showGroupDetails = false;
    groupDetailsLable ="Show Group Details";
    showReportChard = false;
    reportButtonLable = "Show Report";
    reportData;
    showAnimation = true;
    // contactList = [];
    prepareReportData =[];
    splitVPDFImg = splitVuePDFImg;

    headers = this.createHeaders([
        "ItemName",
        "ItemPrice",
        "PaidBy"
    ])
    
    //publishing the group name to group cover component
    @wire(MessageContext)messageContext;
    

    @wire(groupDetailsPage , {GroupId : "$urlParam"}) 
    GroupDetails(result){
        this.refreshGroupNameData = result;
        let data = result.data;
        let error = result.error;
        if(data){
            console.log("Data From Group Details Page Apex Method : ", data);
            this.groupName = data.Name;
            this.groupTotalExpense = data.Group_Total_Expense__c;
            this.groupId=data.Id;
            this.createdDate = this.getDate(data.CreatedDate);

            let payload = {
                value : this.groupName
            }
    
            publish(this.messageContext, splitVue_GrpDetailsPageMsgChnl, payload)
           
        } else if(error){
            console.log("error :" + error);
        }
    }
    //helper function to get the date
    getDate(date) {
        const dateAndTime = date.split("T");
        return dateAndTime[0];
    }

    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        // console.log("id ==> :"+newURL.get('groupRecId'));
        this.urlParam = newURL.get('groupRecId');

        
    }
    

    handleClose(){
        this.closeModal = false;
        this.closeEditGroupNameModal = false;
        this.closeMemberListModal = false;
    }

    handleOpenModal(){
        this.closeModal = true;
    }


    groupNameEditHandler(event){
        this.updateGroupName = event.target.value;
    }

    handleEditGroupNameModal(){
        this.closeEditGroupNameModal = true;
    }

    changeGroupNameHandler(){
        //updating group name by calling Apex
        updateGroupName({GroupId : this.urlParam, GroupName : this.updateGroupName })
        .then(result =>{
            
            this.closeEditGroupNameModal = false;

            if(result.includes("Group Name Updated Successfully")){
                
                this.dispatchEvent(new ShowToastEvent({
                    title : "sucess!",
                    message : result,
                    variant : "success"
    
                }))
            } else if(result.includes("No Change Detected")){
                this.dispatchEvent(new ShowToastEvent({
                    title : "info!",
                    message : result,
                    variant : "info"
    
                }))
            } else if(result.includes("Error While Updating Group Name")){
                this.dispatchEvent(new ShowToastEvent({
                    title : "error!",
                    message : result,
                    variant : "error"
    
                }))
            } else if(result.includes("Exception Occured")){
                this.dispatchEvent(new ShowToastEvent({
                    title : "error!",
                    message : result,
                    variant : "error"
    
                }))
            }
            
            


            // location.reload();
            return refreshApex(this.refreshGroupNameData);


        }).catch(error => {

            console.error("group Name Error : " , error);
        })

        
    }

    openMemberListModal(){

        this.closeMemberListModal = true;
        
    }

    

    showGroupDetailsHanlder(){
        this.showGroupDetails = !this.showGroupDetails;

        if(this.showGroupDetails === false){
            this.groupDetailsLable = "Show Group Details";
        } else if(this.showGroupDetails === true){
            this.groupDetailsLable = "Hide Group Details";
        }


    }

    //code for REPORT
    groupReportHandler(){

        this.showReportChard = !this.showReportChard;
    fetchGroupItems({GroupId : this.urlParam})
    .then(data =>{

        setTimeout(() => {
            this.showAnimation = false ;
        }, 3000);

        this.reportData = data;


        // this.refreshGroupItems = result;
        

        if(this.reportButtonLable === "Show Report"){

            this.reportButtonLable = "Hide Report";
        } else {

            this.reportButtonLable = "Show Report"
        }
        
        
        this.prepareReportData = data.map(Item => ({
            ItemName : Item.Name,
            ItemPrice : Item.Price__c.toString(),
            PaidBy : Item.Paid_By__r.Name
        }))
        console.log("prepareReportData ",this.prepareReportData);
            // this.GroupItems = data;
            // console.log("groupItems : ",data);
            //getting the result with additional trimmed date data
            // this.GroupItems = data.map(gItem => ({
            //     Id: gItem.Id,
            //     Name: gItem.Name,
            //     Price: gItem.Price__c,
            //     PaidByUser : gItem.Paid_By__r.Name,
            //     PaidByUserId: gItem.Paid_By__r.Id,
            //     Date: this.getDate(gItem.CreatedDate),
            //     ItemShared : gItem.Item_Shared_Users__r ? true : false,
            //     SharedUsers : gItem.Item_Shared_Users__r ? this.getItemSharedUsers(gItem.Item_Shared_Users__r) : "Item Is Not Shared"
            // }));

    })
    .catch(error => {

    })    
}

////settle up page code goes here----------

    settleUpPageHandler(event){
        // let recId = event.target.getAttribute("data-recid");
        // console.log("record Id : " + recId);

        // if(recId){
            this[NavigationMixin.Navigate]({
            
                type: 'comm__namedPage',
                attributes: {
                    name: 'settleUpPage__c'
                },
                state : {
                    'groupRecId': this.urlParam
                }    
            })
        // }      
    }

    //code for pdf file

    renderedCallback() {
        // loadScript(this, pdflib).then(() => {});
        // Promise.all(values:[loadScript, (this , JSPDF)]);
        loadScript(this, JSPDF).then(() => {});
      }
    
    
    
      generatePDF(){

        const {jsPDF} = window.jspdf;
        const doc = new jsPDF({
            encryption : {
                userPassword:this.groupName,
                ownerPassword:"owner",
                userPermissions:["print", "modify", "copy", "anot-forms"]
                //try changing the user permission granted
            }
        })
        // doc.addImage(`${this.splitVPDFImg}`, "PNG", 100, 20, 30, 15);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 177, 151);
        doc.text(`Report For The Group ${this.groupName}`, 35, 20);
        doc.setTextColor("red");
        doc.setFontSize(13);
        doc.setFont("times", "normal");
        doc.text(`Group Total Expense : ${this.groupTotalExpense}`, 35, 28);
        doc.setTextColor("black");
        doc.table(35, 40, this.prepareReportData , this.headers, {autosize:true});
        
        
        doc.save(`${this.groupName} - Expense Report.pdf`);

      }
    

      createPdf(){
        getContact().then(result=>{
            console.log("pdf data :",result);
            this.contactList = result;
            this.generatePDF();

        })
        .catch(error=>{
            console.log("pdf error :"+error);
        })
      }

      createHeaders(keys){
        let result = [];
        for(let i = 0; i < keys.length; i += 1){
            result.push({
                id:keys[i],
                name: keys[i],
                prompt: keys[i],
                width: 65,
                align: "center",
                padding:1
            });
        }
        return result;
      }

}