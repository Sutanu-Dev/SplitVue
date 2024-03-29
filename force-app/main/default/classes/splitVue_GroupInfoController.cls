public class splitVue_GroupInfoController {
    @AuraEnabled(cacheable=true)
    public static List<Group__c> fetchGroupData(){
        List<Group__c> GroupList = New List<Group__c>();
        
        GroupList = [Select Id,Name,CreatedDate,Group_Total_Expense__c,
                     (Select Id,Group_Member__c,Group_Member__r.Name FROM User_Groups__r)
                     From Group__c 
                     ORDER BY CreatedDate DESC];
        
        return GroupList;
    }
    
    @AuraEnabled(cacheable=true)
    public static Integer getPercentage(String GroupId){
        Group__c SplitVueGroup = [SELECT Id,Amount_Paid_Percent__c FROM Group__c WHERE Id= :GroupId];
        Integer percentage = SplitVueGroup.Amount_Paid_Percent__c.intValue() ;
        return percentage;
    }
}