```
 CI   |  DEV  |  QA  |  PROD
      |       |      |
+--+  |       |      |
|CC|  |       |      |
+--+  |       |      |
 |    |       |      |
 V    |       |      |
+--+  | +--+  |      |
|CB| -> |CF|  |      |
+--+  | +--+  |      |
      |  |    |      |
      |  V    |      |
      | +--+  | +--+ |
      | |IT| -> |CF| |
      | +--+  | +--+ |
      |       |  |   |
      |       |  V   |
      |       | +--+ |  +--+
      |       | |?| -> |CF|
      |       | +--+ |  +--+
```


1. Create a stack in the *CI* account `testapp-pipeline-stack`
- leave all the values as default

2. Create stacks for the *DEV*, *QA* and *PROD* accounts
- `testapp-dev-stack`
- `testapp-qa-stack`
- `testapp-prod-stack`
- output value `KMSKey` from the stack `testapp-pipeline-stack` as the `KMSKey` parameter 

3. Update the stack in the *CI* account
- change the value of the parameters:
  - `CrossAccountRolesCreated` = `true`
  
4. Update the stack in the *DEV* account
- change the value of the parameters:
  - `AddCodeBuildTest` = `true`
  
![Cross Account Pipeline](https://raw.githubusercontent.com/ttulka/aws-samples/master/pipeline.png)