# Lambda for Approval of CodePipeline

This lamda triggers the manual approval in the pipeline.

## Example
```
[source] -> [build] -> [stage] -> [test] -> [approval] -> [deploy]
                                                ^
                                                |
                                             (lambda)
```

## Run
Call it with the parameters:
```json
{
  "pipeline": "pipeline-with-approval",
  "stage": "Approval",
  "action": "approve-me"
}
```  