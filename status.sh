#!/bin/bash
aws cloudformation describe-stacks --stack-name reinhold-mp | grep "Status"
