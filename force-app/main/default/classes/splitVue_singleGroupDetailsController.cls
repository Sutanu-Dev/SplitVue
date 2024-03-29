public class splitVue_singleGroupDetailsController {
	@AuraEnabled(cacheable=true)
    public static Group__c groupDetailsPage(String GroupId){
        
        Group__c GroupDetails = [Select Id,Name,Group_Total_Expense__c,CreatedDate From Group__c Where Id = :GroupId];
        
        if(GroupDetails != null){
            return GroupDetails;
        } else {
            return null;
        }
    }
    
    @AuraEnabled
    public static String updateGroupName(String GroupName, String GroupId){
        
        
        if(GroupName != null && GroupId != null){
            
            Group__c fetchedGroup = [Select Id,Name From Group__c Where Id = :GroupId];
            
            if(fetchedGroup.Name == GroupName){
                return 'No Change Detected';
            } else {
                fetchedGroup.Name = GroupName;                                  
            
                try {
                    Database.SaveResult GrpResult = Database.update(fetchedGroup , true);
                    
                    if(GrpResult.isSuccess()){
                        return 'Group Name Updated Successfully';
                    } else{
                        return 'Error While Updating Group Name';
                    }
                    
                } catch(Exception e) {
                    return 'Exception Occured : ' + e.getTypeName() + ' - ' + e.getMessage();
                }
            }
            
            
        } else {
            return 'Invalid input parameters. Group Id Or Group Name Is Null';
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<User_Groups__c> fetchGroupMembers(String GroupId){
        
        List<User_Groups__c> UserGroupsDetails = [SELECT Id,Name,Group_Member__r.Name,Group__r.Name 
                                                  FROM User_Groups__c 
                                                  WHERE Group__r.Id = :GroupId];
            
            return UserGroupsDetails;
    }
    
    @AuraEnabled
    public static String deleteGroupMember(String MemberId){
        
        User_Groups__c GroupMember = [SELECT Id,Group_Member__r.Name From User_Groups__c
                                     WHERE Id = :MemberId];
        
        String DeletedMemberName = GroupMember.Group_Member__r.Name;
        
        try{
            Database.DeleteResult deletedMember = Database.delete(GroupMember , true);
            
            if(deletedMember.isSuccess()){
                return DeletedMemberName +' Has Been Removed From The Group';
                
            } else{
                
                return 'Error Removing Member';
            }
            
        } catch(Exception e) {
            
            return 'Exception Occured : ' + e.getTypeName() + ' | ' + e.getMessage();
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<User_Groups__c> searchGroupMembers(String GroupId, String SearchKey){
        String key = '%' + SearchKey + '%';
        List<User_Groups__c> GroupMemberList = [SELECT Id,Group_Member__r.Name 
                                                  FROM User_Groups__c 
                                                  WHERE Group__r.Id = :GroupId AND Group_Member__r.Name Like :key];
        
        if(GroupMemberList.Size() > 0){
            return GroupMemberList;
        } else {
            return null;
        }
    }
}