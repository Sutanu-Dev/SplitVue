public class splitVue_controllerClass {
    
	@AuraEnabled(cacheable=true)
    public static List<CUser__c> fetchUserList(String searchKey){
        List<CUser__c> UserList = new List<CUser__c>();
        
        //return empty list if not data in searchKey
        if(string.isBlank(searchKey)){
            
            return UserList;
            
        } else{
            //build the dynamic query to get the data
            String key = '%' + searchKey + '%';
            UserList = [Select Id,Name From CUser__c WHERE Name Like :key ORDER BY Name LIMIT 5 ];
            return UserList;
        }
    }
    
    @AuraEnabled
    public static String createGroupMembers(String GroupId, List<Object> UserIds){
       
        Set<String> UserIdSet = new Set<String>();
            String eachObject;
        //loop through each Object received in UserIds From LWC
        for(Integer j=0; j<UserIds.size(); j++){
            eachObject = UserIds[j].toString();            
        
            // Split the input string into individual parts
            List<String> parts = eachObject.split(',');
            
            // Loop through each part to find the one containing the "name" attribute
            String nameValue;
            for (String part : parts) {
                if (part.contains('name=')) {
                    // Extract the value of the "name" attribute
                    nameValue = part.substringAfter('name=').trim();
                    break;
                }
            }
     		UserIdSet.add(nameValue);
            // Print the result
            System.debug('Name Value: ' + nameValue);
            
        }
        System.debug('User Ids '+ UserIdSet);

        List<User_Groups__c> UserGroupList = New List<User_Groups__c>();
        
		//null check before inserting records
        if(!UserIdSet.isEmpty() && GroupId != null){

            for(String i :UserIdSet){
                User_Groups__c UG = new User_Groups__c();
                UG.Group_Member__c = i;
                UG.Group__c = GroupId;
                
                UserGroupList.add(UG);
            }
            try{
				//insert the list of record and save the result coming from the database                 
                Database.SaveResult[] UGResults = Database.insert(UserGroupList , true);
                
                //use "checkAllSuccess" helper method to check if success 
                if(checkAllSuccess(UGResults)){
                    if(UGResults.Size() == 1){
                        return UserGroupList.Size() + ' Member Has Been Added';
                    } else {
                        return UserGroupList.Size() + ' Members Have Been Added';
                    }                    
                    
                } else {
                    //Use "handleErrors" helper method to handle the error
                    return handleErrors(UGResults);
                    }
                } catch (Exception e){
                	//check other exception if any
                    return 'Exception Occured : ' + e.getTypeName() + ' - ' + e.getMessage();                                 
            }
        } else {
            //if any of the parameter is empty & if condition failed
            return 'Invalid input parameters. Please provide valid UserIds.';
        }
    }
    
    //checkAllSuccess helper class
    public Static Boolean checkAllSuccess(Database.SaveResult[] results) {
        for (Database.SaveResult result : results) {
            if (!result.isSuccess()) {
                return false;
            }
        }
        return true;
    }
     
    //handleErrors helper class
     private Static String handleErrors(Database.SaveResult[] results) {
        String errorMessage = 'Error inserting records. ';
        for (Database.SaveResult result : results) {
            if (!result.isSuccess()) {
                List<Database.Error> errors = result.getErrors();
                for (Database.Error error : errors) {
                    errorMessage += error.getMessage() + '\n';
                }
            }
        }
        return errorMessage;
    }
}