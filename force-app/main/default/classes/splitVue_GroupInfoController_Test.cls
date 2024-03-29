@isTest
public class splitVue_GroupInfoController_Test {
    
    @TestSetup
    static void setup(){
        List<Group__c> testGroupList = New List<Group__c>();
        
        Group__c group1 = new Group__c(Name = 'group1', Amount_Paid_Percent__c= 50);
        Group__c group2 = new Group__c(Name = 'group2');
        
        testGroupList.add(group1);
        testGroupList.add(group2);
        insert testGroupList;
        
    }
    
    @isTest
    public static void fetchGroupDataTest(){
        List<Group__c> groupList = splitVue_GroupInfoController.fetchGroupData();
        
        System.assertEquals(2 , groupList.Size());
        
    }
    
    @isTest
    public static void getPercentageTest(){
        Group__c group1 = [SELECT Id,Name FROM Group__c WHERE Name = 'group1'];
        Integer groupPercentage = splitVue_GroupInfoController.getPercentage(group1.Id);
        
        System.assertEquals(50 , groupPercentage);
        
    }
}