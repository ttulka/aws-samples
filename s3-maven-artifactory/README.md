# S3 as Maven Artifactory with Property Store for Secrets

CloudFormation templates + sample usage.

- CF stack for Artifactory, Artifactory-User and Property Store parameters
- CF stack for a sample pipeline with a CodeBuild project
- Maven project uploading a sample artifact into the artifactory

# Install

1. Create a CodeCommit repository called `test-project`.
1. Commit and push the content of `test-project` folder into the repository.
1. Create a new CloudFormation stack `s3-artifactory` using the `artifactory.yml` template.
1. Create a new CloudFormation stack `test-project-pipeline` using the `test-project-pipeline.yml` template:
    1. Set `s3-artifactory` as `ArtifactoryStackName` parameter.
1. Watch the pipeline in the CodePipeline console.
   