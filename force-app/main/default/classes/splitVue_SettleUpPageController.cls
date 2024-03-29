public class splitVue_SettleUpPageController {
    
    @AuraEnabled(cacheable=true)
    public static Map<Id,List<Final_Shared_Object__c>> fetchSettleUpCalculation(String GroupId){
        
        Map<Id,List<Final_Shared_Object__c>> mapWithBorrowed = new Map<Id,List<Final_Shared_Object__c>>();
        
        List<Final_Shared_Object__c> allFinalSharedRecords = [SELECT Id,Borrowed__c,Borrowed__r.Name,Amount__c,
                                                              Paid__c,Paid__r.Name,Amounts_Remained__c,Settled_Up__c
                                                              FROM Final_Shared_Object__c
                                                              WHERE Group__c = :GroupId];
        
       // if(allFinalSharedRecords.Size() > 0){
       //     return allFinalSharedRecords;
       // } else {
       //     return null;
       // }
        
        if(allFinalSharedRecords.size() > 0){
            for(Final_Shared_Object__c record :allFinalSharedRecords){
            
            if(mapWithBorrowed.containsKey(record.Borrowed__c)){
                List<Final_Shared_Object__c> borrowedList = mapWithBorrowed.get(record.Borrowed__c);
                borrowedList.add(record);
                mapWithBorrowed.put(record.Borrowed__c, borrowedList);
            } else {
              List<Final_Shared_Object__c> borrowedList = new List<Final_Shared_Object__c>();
            	borrowedList.add(record);          
              mapWithBorrowed.put(record.Borrowed__c, borrowedList);
            }
        }
    }
        
	system.debug(mapWithBorrowed);        
        if(mapWithBorrowed.Size() > 0){
            return mapWithBorrowed;
        } else {
            return null;
        }
}
	
    //main calculation
    public static Void getSumOfAmounts(String GroupId) {
        Map<String, Decimal> sumOfAmountsMap = new Map<String, Decimal>();

        
        List<Borrower_Details__c> records = [SELECT Id, Paid_By__c, Brrowed_Amount__c, Borrowed_By__c
                                            FROM Borrower_Details__c WHERE Group__c = :GroupId];

        
        for (Borrower_Details__c record : records) {
            String key = record.Paid_By__c + '-' + record.Borrowed_By__c;
            Decimal amount = record.Brrowed_Amount__c;

            if (sumOfAmountsMap.containsKey(key)) {
                sumOfAmountsMap.put(key, sumOfAmountsMap.get(key) + amount);
            } else {
                sumOfAmountsMap.put(key, amount);
            }
        }
		system.debug(sumOfAmountsMap);
        
        
        Set<String> allUniqueKeys = sumOfAmountsMap.keySet();
        
        for(String eachKey :allUniqueKeys){
            List<String> keyParts = eachKey.split('-');
            String oppKey = keyParts[1] + '-' + keyParts[0];
            
            if(sumOfAmountsMap.containsKey(oppKey)){
                
                if(sumOfAmountsMap.get(eachKey) > sumOfAmountsMap.get(oppKey)){
                    
                    sumOfAmountsMap.put(eachKey, sumOfAmountsMap.get(eachKey) - sumOfAmountsMap.get(oppKey));
                    sumOfAmountsMap.remove(oppKey);
                    
                } else if(sumOfAmountsMap.get(oppKey) > sumOfAmountsMap.get(eachKey)){
                    
                    sumOfAmountsMap.put(oppKey, sumOfAmountsMap.get(oppKey) - sumOfAmountsMap.get(eachKey));
                    sumOfAmountsMap.remove(eachKey);
                    
                } else if(sumOfAmountsMap.get(oppKey) == sumOfAmountsMap.get(eachKey)){
                    sumOfAmountsMap.remove(oppKey);
                    sumOfAmountsMap.remove(eachKey);
                }
            }
        }
        system.debug(sumOfAmountsMap);
        
        List<Final_Shared_Object__c> insertAllFinalSharing = new List<Final_Shared_Object__c>();
        
        List<Final_Shared_Object__c> getAllFinalSharing = [SELECT Id,Borrowed__c,Paid__c,Amount__c 
                                                           FROM Final_Shared_Object__c 
                                                           WHERE Group__c = :GroupId];
        
        if(getAllFinalSharing.Size() > 0){
            Database.DeleteResult[] DR = Database.Delete(getAllFinalSharing, true);
            System.debug('delete result '+ DR);
        }
        
        for(String eachKey :sumOfAmountsMap.keySet()){
            
            String[] keyParts = eachKey.split('-');
            
            Final_Shared_Object__c FinalSharingRecord = new Final_Shared_Object__c();
            		FinalSharingRecord.Borrowed__c = keyParts[1];
                    FinalSharingRecord.Paid__c = keyParts[0];
                    FinalSharingRecord.Amount__c = sumOfAmountsMap.get(eachKey);
                    FinalSharingRecord.Group__c = GroupId;
                    
                    insertAllFinalSharing.add(FinalSharingRecord);
        }
        
        try{
            Database.SaveResult[] SR = Database.Insert(insertAllFinalSharing, true);
            System.debug('Insert result :'+SR);
            
        } catch(Exception e){
            System.debug('error from upsertAllFinalSharing' + e.getTypeName() + ' | ' + e.getMessage());        
        }
        
        /*Set<String> setOfUniqueCombo = new Set<String>();
        
        List<Final_Shared_Object__c> getAllFinalSharing = [SELECT Id,Borrowed__c,Paid__c,Amount__c 
                                                           FROM Final_Shared_Object__c 
                                                           WHERE Group__c = :GroupId];
        
        for(Final_Shared_Object__c record :getAllFinalSharing){
            String setValue = record.Paid__c + '-' + record.Borrowed__c;
            setOfUniqueCombo.add(setValue);
        }
        
        List<Final_Shared_Object__c> upsertAllFinalSharing = new List<Final_Shared_Object__c>();
        List<Final_Shared_Object__c> recordsToBeDeleted = new List<Final_Shared_Object__c>();
        
        for(String eachKey :sumOfAmountsMap.keySet()){
            
            String[] keyParts = eachKey.split('-');
            
            if(getAllFinalSharing.Size() > 0){
                
                for(Final_Shared_Object__c record :getAllFinalSharing){
                
               		if(record.Paid__c == keyParts[0] && record.Borrowed__c == keyParts[1]){
                    
                      	record.Amount__c = sumOfAmountsMap.get(eachKey);
                      	upsertAllFinalSharing.add(record);
                    } else if(record.Paid__c != keyParts[0] && record.Borrowed__c != keyParts[1]){
                        recordsToBeDeleted.add(record);
                        
                    }
            	}
                
                if(!setOfUniqueCombo.contains(eachKey)){
                    Final_Shared_Object__c FinalSharingRecord = new Final_Shared_Object__c();
            		FinalSharingRecord.Borrowed__c = keyParts[1];
                    FinalSharingRecord.Paid__c = keyParts[0];
                    FinalSharingRecord.Amount__c = sumOfAmountsMap.get(eachKey);
                    FinalSharingRecord.Group__c = GroupId;
                    
                    upsertAllFinalSharing.add(FinalSharingRecord);
                }
            } else {
                    Final_Shared_Object__c FinalSharingRecord = new Final_Shared_Object__c();
            		FinalSharingRecord.Borrowed__c = keyParts[1];
                    FinalSharingRecord.Paid__c = keyParts[0];
                    FinalSharingRecord.Amount__c = sumOfAmountsMap.get(eachKey);
                    FinalSharingRecord.Group__c = GroupId;
                    
                    upsertAllFinalSharing.add(FinalSharingRecord);
                }
            }
        
        system.debug('records to be upserted :'+upsertAllFinalSharing);
        system.debug('records to be deleted :'+recordsToBeDeleted);
        try{
            Database.DeleteResult[] DR = Database.delete(recordsToBeDeleted, true);
            Database.UpsertResult[] UR = Database.upsert(upsertAllFinalSharing, true);
            
            
            System.debug('delete result :' + DR);
        	System.debug('update result :' + UR);

        } catch(Exception e){
            
            System.Debug('error from upsertAllFinalSharing' + e.getTypeName() + ' | ' + e.getMessage());
        }*/   
    }
    @AuraEnabled
    public static Integer updatePaidAmount(Integer PaidAmount, String RecordId, String GroupId, Integer TotalAmountToBePaid) {
        
        try {
            Final_Shared_Object__c sharedObjectRecordToUpdate = [SELECT Id, Amount__c, Amounts_Paid__c FROM Final_Shared_Object__c WHERE Id = :RecordId];
            
            if (sharedObjectRecordToUpdate != null) {
                Decimal RemainingAmount = sharedObjectRecordToUpdate.Amount__c - (sharedObjectRecordToUpdate.Amounts_Paid__c + PaidAmount);
                
                if (RemainingAmount < 1) {
                    sharedObjectRecordToUpdate.Amounts_Paid__c = sharedObjectRecordToUpdate.Amounts_Paid__c + PaidAmount;
                    sharedObjectRecordToUpdate.Settled_Up__c = true;
                    update sharedObjectRecordToUpdate;
                    //fetch and update associate group record
                    Integer Percentage = getTotalPaidAmount(GroupId, TotalAmountToBePaid);
                    return Percentage;
                } else {
                    sharedObjectRecordToUpdate.Amounts_Paid__c = sharedObjectRecordToUpdate.Amounts_Paid__c + PaidAmount;
                	update sharedObjectRecordToUpdate;
                    //fetch and update associate group record
                    Integer Percentage = getTotalPaidAmount(GroupId, TotalAmountToBePaid);
                    return Percentage;
                }
            } else {
                return 0; 
            }
        } catch (Exception e) {
            system.debug(e.getTypeName() + ' | ' + e.getMessage());
            return 0; 
        }
        
    }
    
    public static Integer getTotalPaidAmount(String GroupId, Integer TotalAmountToBePaid){
        Group__c GroupWithItemSharedUsers = [SELECT Id,Total_Paid_Amount__c,Amount_Paid_Percent__c,
                                                   (SELECT Id,Amounts_Paid__c FROM Final_Shared_Object__r) 
                                                   FROM Group__c
                                                   WHERE Id = :GroupId];
        List<Final_Shared_Object__c> allSharedObjectRecords = GroupWithItemSharedUsers.Final_Shared_Object__r;
        Decimal TotalPaidAmount = 0;
        
        for(Final_Shared_Object__c record :allSharedObjectRecords){
            TotalPaidAmount = record.Amounts_Paid__c + TotalPaidAmount;
        }
        
        Database.SaveResult sr ;
        
        Decimal percentage = (TotalPaidAmount / TotalAmountToBePaid) * 100;
        
        if(percentage >= 1){
            GroupWithItemSharedUsers.Total_Paid_Amount__c = TotalPaidAmount;
            GroupWithItemSharedUsers.Amount_Paid_Percent__c = percentage;
            
            sr = Database.update(GroupWithItemSharedUsers, true);
            
            return Math.Ceil(percentage).intValue();
            
        } else if(percentage <1){
            GroupWithItemSharedUsers.Total_Paid_Amount__c = TotalPaidAmount;
            GroupWithItemSharedUsers.Amount_Paid_Percent__c = 100;
            
            sr = Database.update(GroupWithItemSharedUsers, true);
            return 100;
        } else {
            return 0;
        }
        
    }

}