# Release Pipeline

This product release pipeline triggers the manual approval in service pipelines.

## Prepare
1. Create a CodeCommit repositories `my-service-a` and `my-service-b`.
1. Commit the content of `service-codebase` into both of them.
1. Create a CodeCommit repository `my-e2e-tests`.
1. Commit an empty file into the `my-e2e-tests` repository (just to create a `master` branch).  

## Install

1. Create a CloudFormation stack `my-service-a-pipeline` by template `service-pipeline.yml` with following parameters:
  - `service-a` as `ProjectName`
  - `my-service-a` as `CodeCommitRepoName`
1. Create a CloudFormation stack `my-service-b-pipeline` by template `service-pipeline.yml` with following parameters:
  - `service-b` as `ProjectName`
  - `my-service-b` as `CodeCommitRepoName`
1. Create a CloudFormation stack `my-release-pipeline` by template `release-pipeline.yml`.  