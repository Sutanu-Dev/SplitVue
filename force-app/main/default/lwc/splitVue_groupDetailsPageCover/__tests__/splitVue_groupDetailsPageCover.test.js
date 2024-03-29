import { createElement } from 'lwc';
import SplitVue_groupDetailsPageCover from 'c/splitVue_groupDetailsPageCover';

describe('c-split-vue-group-details-page-cover', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-split-vue-group-details-page-cover', {
            is: SplitVue_groupDetailsPageCover
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});