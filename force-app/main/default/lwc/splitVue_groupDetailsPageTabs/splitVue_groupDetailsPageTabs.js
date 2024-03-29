import { LightningElement } from 'lwc';

export default class SplitVue_groupDetailsPageTabs extends LightningElement {

    GroupIdFromurlParam; //receives the Group Id From The URL

    connectedCallback(){
        let testURL = window.location.href;
        let newURL = new URL(testURL).searchParams;
        console.log("id ==> :"+newURL.get('groupRecId'));
        this.GroupIdFromurlParam = newURL.get('groupRecId');
    }
}