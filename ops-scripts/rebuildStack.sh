#!/bin/bash

set +x

if ! aws s3 cp MarcoPolo-POC.template s3://marco-polo-cloudformation/MarcoPolo-POC.template; then
    printf "Failed to copy template\n"
    exit 1
fi

aws cloudformation delete-stack --stack-name reinhold-mp

printf "\nWaiting for stack to be deleted\n"
#Loop until describe stack returns an error code - signifies stack is completely deleted
until $(! aws cloudformation describe-stacks --stack-name reinhold-mp > /dev/null); do
    printf '.'
    sleep 5
done
printf "\nStack deleted!\n"

printf "\nCreating new stack\n"
if ! aws cloudformation create-stack --stack-name reinhold-mp --template-url https://s3-us-west-2.amazonaws.com/marco-polo-cloudformation/MarcoPolo-POC.template > /dev/null; then
    printf "Error calling create-stack\n"
    exit 1
fi

#Loop until "CREATE_COMPLETE" shows up
until $(aws cloudformation describe-stacks --stack-name reinhold-mp | grep "StackStatus" | grep -q "COMPLETE" ); do
    printf '.'
    sleep 5
done

aws cloudformation describe-stacks --stack-name reinhold-mp | grep "StackStatus"

