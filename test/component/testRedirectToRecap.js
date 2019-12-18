'use strict';

const TestWrapper = require('test/util/TestWrapper');
const RecapPage = require('app/steps/ui/recap');

describe('redirect to recap', () => {
    let testWrapper, sessionData;
    const expectedUrlForRecapPage = RecapPage.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('CopiesUk');
        sessionData = {
            ccdCase: {
                state: 'CaseCreated',
                id: 1535395401245028
            },
            declaration: {
                declarationCheckbox: 'true'
            },
            payment: {
                status: 'Success'
            }
        };
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    it(`test it redirects to Documents page when the application was submitted: ${expectedUrlForRecapPage}`, (done) => {
        testWrapper.agent.post('/prepare-session/form')
            .send(sessionData)
            .end(() => {
                testWrapper.agent.get(testWrapper.pageUrl)
                    .expect('location', '/recap')
                    .expect(302)
                    .end((err) => {
                        testWrapper.server.http.close();
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });
    });
});
