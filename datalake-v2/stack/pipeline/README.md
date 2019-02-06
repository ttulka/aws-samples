1. Create a stack in the *CI* account `<productSuffix>-datalake-pipeline`
- leave all the values as default

2. Create stacks for the *DEV*, *RC*, *QA* and *PROD* accounts `<productSuffix>-datalake-pipeline`
- output value `KMSKey` from the *CI* stack as the `KMSKey` parameter 

3. Update the stack in the *CI* account
- change the value of the parameters:
  - `CrossAccountRolesCreated` = `true`
