# AuthConnect - Integration Tests

Test suites to be run in the integration build pipeline after the stack has been deployed.

This module is not about to be deployed anywhere.

## Install

Environment variables to be set:

- `AUTHORIZER_LAMBDA`

- `APP_TOKEN_PROVIDER_LAMBDA`
- `APP_ID`
- `APP_PASSWORD`
- `APP_TENANT_ID`

- `USER_TOKEN_PROVIDER_LAMBDA`
- `USER_ID`
- `USER_PASSWORD`

## Run
```
npm test
``` 
