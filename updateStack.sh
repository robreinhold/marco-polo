#!/bin/bash

aws s3 cp MarcoPolo-POC.template s3://marco-polo-cloudformation/MarcoPolo-POC.template

aws cloudformation update-stack --stack-name reinhold-mp --template-url https://s3-us-west-2.amazonaws.com/marco-polo-cloudformation/MarcoPolo-POC.template

aws cloudformation describe-stacks --stack-name reinhold-mp

echo "Keep running this:"
echo "aws cloudformation describe-stacks --stack-name reinhold-mp"