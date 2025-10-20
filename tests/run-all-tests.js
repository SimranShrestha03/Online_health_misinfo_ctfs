/**
 * Run all CTF tests
 * Execute with: npm test or node tests/run-all-tests.js
 */

const FlagVerificationTester = require('./flag_verification.test.js');
const DatasetValidationTester = require('./dataset_validation.test.js');
const AccessibilityTester = require('./accessibility.test.js');

class TestRunner {
    constructor() {
        this.results = [];
    }

    async runAllTests() {
        console.log('🚀 Starting CTF Test Suite');
        console.log('============================\n');

        try {
            // Run flag verification tests
            console.log('1️⃣  Running Flag Verification Tests');
            console.log('-----------------------------------');
            const flagTester = new FlagVerificationTester();
            await flagTester.runTests();
            console.log('\n');

            // Run dataset validation tests
            console.log('2️⃣  Running Dataset Validation Tests');
            console.log('-----------------------------------');
            const datasetTester = new DatasetValidationTester();
            await datasetTester.runTests();
            console.log('\n');

            // Run accessibility tests
            console.log('3️⃣  Running Accessibility Tests');
            console.log('--------------------------------');
            const accessibilityTester = new AccessibilityTester();
            await accessibilityTester.runTests();
            console.log('\n');

            // Summary
            this.printSummary();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    printSummary() {
        console.log('🎯 Test Suite Summary');
        console.log('======================');
        console.log('✅ Flag verification tests completed');
        console.log('✅ Dataset validation tests completed');
        console.log('✅ Accessibility tests completed');
        console.log('\n📋 Next Steps:');
        console.log('1. Review any failed tests above');
        console.log('2. Fix issues and re-run tests');
        console.log('3. Deploy to your hosting platform');
        console.log('4. Test in real browsers');
        console.log('5. Validate with screen readers');
        console.log('\n🔗 Useful Resources:');
        console.log('- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
        console.log('- Web Accessibility Testing: https://www.w3.org/WAI/ER/tools/');
        console.log('- CTF Security Best Practices: See security_notes.md');
    }
}

// Run all tests if this file is executed directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests().catch(console.error);
}

module.exports = TestRunner;
