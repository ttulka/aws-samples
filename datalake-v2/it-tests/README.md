# Integration Tests for DataLake

## Install
```
npm install
```

## Run
```
# setup proxy if run localy:
# set HTTPS_PROXY=https://proxy-host:1234

# setup aws credentials if run localy:
# set AWS_PROFILE=aws-user-from-credentials
# set AWS_REGION=eu-central-1

# setup env variables:
set UPLOAD_PACKAGE_LAMBDA=...
set DOWNLOAD_PACKAGE_LAMBDA=...
set SEARCH_PACKAGE_LAMBDA=...
set PUBLISH_PACKAGE_LAMBDA=...
set TAGGING_SERVICE_LAMBDA=...

npm test
```