#!/bin/bash

set +x

if ! aws s3 cp MarcoPolo-POC.template s3://marco-polo-cloudformation/MarcoPolo-POC.template --profile write; then
    printf "Failed to copy template"
    return 1
fi

aws cloudformation delete-stack --stack-name reinhold-mp --profile write

printf "Waiting for stack to be deleted"
#Loop until describe stack returns an error code - signifies stack is completely deleted
until $(! aws cloudformation describe-stacks --stack-name reinhold-mp > /dev/null); do
    printf '.'
    sleep 5
done
printf "Stack deleted!"

printf "Creating new stack"
aws cloudformation create-stack --stack-name reinhold-mp --template-url https://s3-us-west-2.amazonaws.com/marco-polo-cloudformation/MarcoPolo-POC.template --profile write

#Loop until "CREATE_COMPLETE" shows up
until $(aws cloudformation describe-stacks --stack-name reinhold-mp | grep -q "CREATE_COMPLETE"); do
    printf '.'
    sleep 5
done

printf "Stack is CREATE_COMPLETE. EC2 instances may still be bootstrapping"
