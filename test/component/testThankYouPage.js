'use strict';

const TestWrapper = require('test/util/TestWrapper');
const config = require('config');
const content = require('app/resources/en/translation/thankyou');
const commonContent = require('app/resources/en/translation/common');

describe('thank-you', () => {
    let testWrapper;

    beforeEach(() => {
        testWrapper = new TestWrapper('ThankYou');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test content loaded on the page when CCD Case ID not present', (done) => {
            const playbackData = {
                referenceNumber: content.referenceNumber,
                checkSummaryLink: content.checkAnswersPdf,
                declarationLink: content.declarationPdf
            };

            testWrapper.testContentNotPresent(done, playbackData);
        });

        it('test content loaded on the page when CCD Case ID present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                declaration: {
                    declarationCheckbox: 'true'
                },
                payment: {
                    total: 0
                }
            };
            const contentToExclude = ['saveYourApplication', 'saveParagraph1', 'declarationPdf', 'checkAnswersPdf', 'coverSheetPdf'];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        helpLineNumber: commonContent.helpTelephoneNumber,
                        findOutNext: config.links.findOutNext
                    };

                    testWrapper.testContent(done, contentData, contentToExclude);
                });
        });

        it('test content loaded on the page when CheckAnswers present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                declaration: {
                    declarationCheckbox: 'true'
                },
                payment: {
                    total: 0
                },
                checkAnswersSummary: '{test: "data"}'
            };
            const contentToExclude = ['declarationPdf', 'coverSheetPdf'];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        helpLineNumber: commonContent.helpTelephoneNumber,
                        findOutNext: config.links.findOutNext,
                        saveYourApplication: content.saveYourApplication,
                        checkSummaryLink: content.checkAnswersPdf
                    };

                    testWrapper.testContent(done, contentData, contentToExclude);
                });
        });

        it('test content not loaded on the page when exclusively CheckAnswers present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                checkAnswersSummary: '{test: "data"}'
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        declarationLink: content.declarationPdf
                    };

                    testWrapper.testContentNotPresent(done, playbackData);
                });
        });

        it('test content loaded on the page when LegalDeclaration present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                declaration: {
                    declarationCheckbox: 'true'
                },
                payment: {
                    total: 0
                },
                legalDeclaration: '{test: "data"}'
            };
            const contentToExclude = ['checkAnswersPdf'];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        helpLineNumber: commonContent.helpTelephoneNumber,
                        findOutNext: config.links.findOutNext,
                        saveYourApplication: content.saveYourApplication,
                        declarationLink: content.declarationPdf
                    };

                    testWrapper.testContent(done, contentData, contentToExclude);
                });
        });

        it('test content loaded on the page when exclusively LegalDeclaration present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                legalDeclaration: '{test: "data"}'
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        checkSummaryLink: content.checkAnswersPdf
                    };

                    testWrapper.testContentNotPresent(done, playbackData);
                });
        });

        it('test content loaded on the page when CheckAnswers and LegalDeclaration present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                declaration: {
                    declarationCheckbox: 'true'
                },
                payment: {
                    total: 0
                },
                checkAnswersSummary: '{test: "data"}',
                legalDeclaration: '{test: "data"}'
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        helpLineNumber: commonContent.helpTelephoneNumber,
                        findOutNext: config.links.findOutNext,
                        saveYourApplication: content.saveYourApplication,
                        checkSummaryLink: content.checkAnswersPdf,
                        declarationLink: content.declarationPdf
                    };

                    testWrapper.testContent(done, contentData);
                });
        });

        it('test content loaded on the page so Cover Sheet download is present', (done) => {
            const sessionData = {
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                declaration: {
                    declarationCheckbox: 'true'
                },
                payment: {
                    total: 0
                }
            };
            const contentToExclude = ['checkAnswersPdf', 'declarationPdf'];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        helpLineNumber: commonContent.helpTelephoneNumber,
                        findOutNext: config.links.findOutNext,
                        saveYourApplication: content.saveYourApplication,
                        coverSheetLink: content.coverSheetPdf
                    };

                    testWrapper.testContent(done, contentData, contentToExclude);
                });
        });
    });
});
