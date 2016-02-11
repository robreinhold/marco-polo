#!/bin/bash

set +x

if ! aws s3 cp MarcoPolo-POC.template s3://marco-polo-cloudformation/MarcoPolo-POC.template --profile write; then
    printf "Failed to copy template\n"
    exit 1
fi


printf "\Updating stack\n"
if ! aws cloudformation update-stack --stack-name reinhold-mp --template-url https://s3-us-west-2.amazonaws.com/marco-polo-cloudformation/MarcoPolo-POC.template --profile write > /dev/null; then
    printf "Error calling create-stack\n"
    exit 1
fi

#Loop until "COMPLETE" shows up
until $(aws cloudformation describe-stacks --stack-name reinhold-mp | grep "StackStatus" | grep -q "COMPLETE" ); do
    printf '.'
    sleep 5
done

printf "\n\nStack COMPLETE. EC2 instances may still be bootstrapping\n\n"
