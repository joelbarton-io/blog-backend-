/* 
install: 
- supertest
- express-async-errors
- crossenv

add to package.json:
- test script
- & crossenv

add TEST_MONGODB_URI to .env file

in main.test.js:
    - import blog model, test, describe, after, beforeEach assert, helper
    - wrap app instance in supertest
    - setup mongoose disconnect
    - write tests
        - beforeEach
        - routes
        - general
*/
