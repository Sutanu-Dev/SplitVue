public class splitVueBorrowerDetailsController {
	
    //this method will update borrower details records for paidBy field value change in Group Item 
    //and 
    //delete the one matches paid by and borrowed by values 
    public static void updateBorrowerDetails(Group_Item__c OldGroupItem, Group_Item__c NewGroupItem){
        List<Borrower_Details__c> updateAllRecords = new List<Borrower_Details__c>();
        List<Borrower_Details__c> deleteRecords = new List<Borrower_Details__c>();
        
        for(Borrower_Details__c record :[SELECT Id,Paid_By__c,Borrowed_By__c FROM Borrower_Details__c 
                                         WHERE Group_Item__c = :NewGroupItem.Id]){
            
             if(record.Borrowed_By__c != NewGroupItem.Paid_By__c){
                 record.Paid_By__c = NewGroupItem.Paid_By__c;
                 
                 updateAllRecords.add(record);
                 
             } else if(record.Borrowed_By__c == NewGroupItem.Paid_By__c){
                 deleteRecords.add(record);
             }
        }
        
        /*Item_Shared_Users__c record = [SELECT Id,CUser__c,Group_Item__c,Shared_Price__c,Group_Item__r.Group__c FROM Item_Shared_Users__c 
                                          WHERE Group_Item__c= :NewGroupItem.Id AND CUser__c= :OldGroupItem.Paid_By__c LIMIT 1];
            if(record != null){
                Borrower_Details__c BD = new Borrower_Details__c();
                BD.Borrowed_By__c      = record.CUser__c;
                BD.Brrowed_Amount__c   = record.Shared_Price__c;
                BD.Group__c 		   = record.Group_Item__r.Group__c;
                BD.Paid_By__c 		   = NewGroupItem.Paid_By__c;
                BD.Group_Item__c 	   = NewGroupItem.Id;
                BD.Item_Shared_User__c = record.Id;
                
                upsertAllRecords.add(BD);
            }*/
        
        System.debug('updateAllRecords :'+ updateAllRecords );
        System.debug('deleteRecords :'+ deleteRecords );
        
        if(updateAllRecords.Size() > 0){
            Database.SaveResult[] SR = Database.Update(updateAllRecords, true);
            System.debug('SR :'+ SR );
        }
        
        if(deleteRecords.Size() > 0){
            Database.DeleteResult[] DR = Database.Delete(deleteRecords, true);
            System.debug('DR :'+ DR );
        }
        	
    }
    
    //this method will delete borrower details when a parent Item Shared User is deleted
    public static void deleteAllBorrowedUsersForOneItemSharedUsers(List<Item_Shared_Users__c> DeletedRecords){
        
        List<Borrower_Details__c> allBorrowerDetailsWithEmptyParentField = [SELECT Id FROM Borrower_Details__c 
                                                                            WHERE Item_Shared_User__c = :DeletedRecords[0].Id];
        
        System.debug('allBorrowerDetailsWithEmptyParentField ::'+allBorrowerDetailsWithEmptyParentField);
        
        if(allBorrowerDetailsWithEmptyParentField.Size() > 0){
            Database.DeleteResult[] DR = Database.Delete(allBorrowerDetailsWithEmptyParentField, true);
            System.debug('DR :::' + DR);
        }
    }
}