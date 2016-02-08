#!/bin/bash
aws s3 cp MarcoPolo-POC.template s3://marco-polo-cloudformation/MarcoPolo-POC.template
aws cloudformation create-stack --stack-name reinhold-mp --template-url https://s3-us-west-2.amazonaws.com/marco-polo-cloudformation/MarcoPolo-POC.template

echo "Keep running this:"
echo "aws cloudformation describe-stacks --stack-name reinhold-mp"