import { createElement } from 'lwc';
import SplitVue_seeRemoveGroupMembers from 'c/splitVue_seeRemoveGroupMembers';

describe('c-split-vue-see-remove-group-members', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-split-vue-see-remove-group-members', {
            is: SplitVue_seeRemoveGroupMembers
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});