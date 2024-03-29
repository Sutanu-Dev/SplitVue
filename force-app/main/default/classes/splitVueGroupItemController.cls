public class splitVueGroupItemController {
    
    @AuraEnabled(cacheable=true)
    public static List<Group_Item__c> fetchGroupItems(String GroupId){
        List<Group_Item__c> groupItems = [SELECT Id,Name,CreatedDate,Price__c,Paid_By__r.Name,Group__c,
                                          (Select Id,CUser__r.Name From Item_Shared_Users__r)//child
                                          FROM Group_Item__c 
                                          WHERE Group__c = :GroupId ORDER BY CreatedDate DESC];
        
        return groupItems;
    }
    
    @AuraEnabled
    public static String createGroupItemWithItemSharedUsers(String GroupId, Integer ItemPrice, 
                                                          String ItemName, String PaidByUserId, List<String> SharedUsers){
        
       
        
           if(GroupId != null && ItemPrice != null && ItemName != null && PaidByUserId != null && SharedUsers != null){
               
              try { Group_Item__c newGroupItem = new Group_Item__c();
                   
                   newGroupItem.Group__c   = GroupId;
                   newGroupItem.Name	   = ItemName;
                   newGroupItem.Paid_By__c = PaidByUserId;
                   newGroupItem.Price__c   = ItemPrice;
                   
               
               
                   Database.SaveResult GrpItemResult = Database.insert(newGroupItem , true);
                   
                    List<Item_Shared_Users__c> SharedUserList = new List<Item_Shared_Users__c>();
                   
                   for(String UserId :SharedUsers){
                       Item_Shared_Users__c newSharedUser = new Item_Shared_Users__c();
                       
                       newSharedUser.Group_Item__c  = newGroupItem.Id;
                       newSharedUser.CUser__c	    = UserId;
                       
                       
                       SharedUserList.add(newSharedUser);
                   }
                   
                   Database.SaveResult[] newSharedUsersResult = Database.insert(SharedUserList , true);
                   
                   if(GrpItemResult.isSuccess() && splitVue_controllerClass.checkAllSuccess(newSharedUsersResult)){
                       return ItemName + ' is Added To ' + groupName(GroupId);
                   } else {
                       return 'Group Item Couldn\'t Be Added';
                   }
               } catch(Exception e){
                   return 'Exception Occured : ' + e.getTypeName() + ' | ' + e.getMessage();
               }
               
           } else {
               return 'Invalid Parameters';
           }                            
             
                                                              
    }
    @AuraEnabled
    public static String deleteGroupItem(String GroupItemId, String GroupItemName, String GroupId){
        List<Group_Item__c> deleteGrpItm = [SELECT Id,Name FROM Group_Item__c 
                                            WHERE Id = :GroupItemId];
        
        try{
            Database.DeleteResult[] deletedGItem = Database.delete(deleteGrpItm , true);
            
            if(checkAllDeleted(deletedGItem)){
                return GroupItemName +' Has Been Removed From ' + groupName(GroupId);
                
            } else{
                
                return 'Item Couldn\'t Be Deleted';
            }
            
        } catch(Exception e) {
            
            return 'Exception Occured : ' + e.getTypeName() + ' | ' + e.getMessage();
        }
        
    }
    
    //checkAllSuccess helper class
    public Static Boolean checkAllDeleted(Database.DeleteResult[] results) {
        for (Database.DeleteResult result : results) {
            if (!result.isSuccess()) {
                return false;
            }
        }
        return true;
    }
               
    //helper class to get the Group Name
     public static String groupName(String GroupId){
            Group__c CGroup = [SELECT Id,Name FROM Group__c
                                WHERE Id = :GroupId];
            return CGroup.Name;
    }
    
    @AuraEnabled
    public static void updateGroupItemWithSharedUsers(String GroupItemId, String GroupId, Integer ItemPrice, 
                                       String ItemName, String PaidByUserId, List<String> SharedUsers ){
                                           
        Group_Item__c fetchGroupItem = [SELECT Id,Name,Price__c,Paid_By__c,Group__c 
                                        FROM Group_Item__c WHERE Id = :GroupItemId];
                                           
               fetchGroupItem.Price__c = ItemPrice;
               fetchGroupItem.Paid_By__c = PaidByUserId;
               fetchGroupItem.Name = ItemName;
                                           
               update(fetchGroupItem);
                                           
              List<Item_Shared_Users__c> sharedUsersToUpsert = new List<Item_Shared_Users__c>();
              
               if(!SharedUsers.isEmpty()){
                    List<Item_Shared_Users__c> existingSharedUsers = [SELECT Id,CUser__c FROM Item_Shared_Users__c 
                                                                      WHERE Group_Item__c = :GroupItemId ];                        
                                           
               
                  List<String> MapExistingSharedUsers = new List<String>(); 
                   
                   for(Item_Shared_Users__c existingUser :existingSharedUsers){
                       
                       MapExistingSharedUsers.add(existingUser.CUser__c);
                   }
                   Set<String> uniqueSharedUsers = new Set<String>(SharedUsers);
                   for(String user :uniqueSharedUsers){
                       if(!MapExistingSharedUsers.contains(user)){
                           
                           Item_Shared_Users__c sharedUserInsert = new Item_Shared_Users__c();
                           sharedUserInsert.CUser__c = user;
                           sharedUserInsert.Group_Item__c = GroupItemId;
                           sharedUsersToUpsert.add(sharedUserInsert);
                       } 
                   }
              Database.upsert(sharedUsersToUpsert, true);
                   
         }
    }
    
    public static void updateItemSharedUserRecordAfterInsert(List<Item_Shared_Users__c> ItemSharedUsers){
        
        Group_Item__c groupItem = [SELECT Id,Price__c,(SELECT Id FROM Item_Shared_Users__r) 
                                   FROM Group_Item__c
                                   WHERE Id = :ItemSharedUsers[0].Group_Item__c];
                
        List<Item_Shared_Users__c> allSharedUsersFromItem = groupItem.Item_Shared_Users__r;
        
        
        List<AggregateResult> sharedUserNumber = [SELECT count(Group_Item__c) userNumber 
                                    FROM Item_Shared_Users__c 
                                    WHERE Group_Item__c = :ItemSharedUsers[0].Group_Item__c];
        Integer totalCount;
        if (sharedUserNumber.size() > 0) {
    		// Access the count using the alias
     		totalCount = (Integer)sharedUserNumber[0].get('userNumber');
		}

		List<Item_Shared_Users__c> updateSharedPrice = new List<Item_Shared_Users__c>();
        
        for(Item_Shared_Users__c itemSharedUser :allSharedUsersFromItem){
            
            itemSharedUser.Shared_Price__c = groupItem.Price__c/totalCount;
            	
            updateSharedPrice.add(itemSharedUser);
            
           }
        
        update(updateSharedPrice);   
    }
    
    public static void updateItemSharedUserRecordAfterDelete(List<Item_Shared_Users__c> ItemSharedUsers){
         
        Group_Item__c groupItem = [SELECT Id,Price__c,(SELECT Id FROM Item_Shared_Users__r) 
                                   FROM Group_Item__c
                                   WHERE Id = :ItemSharedUsers[0].Group_Item__c];
        
        Integer totalSharedUserSize = groupItem.Item_Shared_Users__r.size();
        Integer numberOfUserToBeSHaredWIth = totalSharedUserSize - ItemSharedUsers.size();
        List<Item_Shared_Users__c> allSharedUsersFromGroupItem = groupItem.Item_Shared_Users__r;
        
        List<Item_Shared_Users__c> updateSharedPrice = new List<Item_Shared_Users__c>();
        
        if(numberOfUserToBeSHaredWIth > 0){
            
            for(Item_Shared_Users__c itemSharedUser :allSharedUsersFromGroupItem){
                
                itemSharedUser.Shared_Price__c = groupItem.Price__c/numberOfUserToBeSHaredWIth;
            	updateSharedPrice.add(itemSharedUser); 
            }
        }
        if(updateSharedPrice.Size() > 0){
            Database.update(updateSharedPrice, true);
        } 
    }
    //Update all item shared users for a single group item
    public static void updateItemSharedUser(List<Group_Item__c> GroupItem){
        
        List<Item_Shared_Users__c> ItemSharedUsers = [SELECT Id FROM Item_Shared_Users__c 
                                                           			WHERE Group_Item__c = :GroupItem[0].Id];
        Integer itemSharedUserSize = ItemSharedUsers.size();
        List<Item_Shared_Users__c> usersToUpdate = new List<Item_Shared_Users__c>();
        
        for(Item_Shared_Users__c itemSharedUser :ItemSharedUsers){
            itemSharedUser.Shared_Price__c = GroupItem[0].Price__c/itemSharedUserSize;
            
            usersToUpdate.add(itemSharedUser);
        }
        
		update(usersToUpdate);        
    }
    
    public static void deleteAllItemSharedUsersForOneGroupItem(Group_Item__c DeletedRecord){
        
        List<Item_Shared_Users__c> Records = [SELECT Id From Item_Shared_Users__c 
                                              WHERE Group_Item__c = :DeletedRecord.Id];
        
        if(Records.Size() > 0){
            Database.DeleteResult[] DR = Database.Delete(Records, true);
        }
    }
    
}