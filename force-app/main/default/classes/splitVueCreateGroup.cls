public with sharing class splitVueCreateGroup {
    @AuraEnabled
    public static void createGroup(String GroupNames) {

        List<Group__c> grpList= New List<Group__c>();

        if(GroupNames != null){
            Group__c obj = new Group__c();
            obj.Name = GroupNames;
            
            grpList.add(obj);
        }
        if(!grpList.isEmpty()){
            System.debug('Group List : '+ grpList);
            insert grpList;
        }
       
    }
}