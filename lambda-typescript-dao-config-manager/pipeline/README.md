# Cross-Accounts Pipeline

1. Create a stack in the *CI* account `config-manager-pipeline-stack`
- leave all the values as default

2. Create stacks for the *DEV* account `config-manager-pipeline-stack`
- output value `KMSKey` from the *CI* stack as the `KMSKey` parameter 

3. Update the stack in the *CI* account
- change the value of the parameters:
  - `CrossAccountRolesCreated` = `true`
