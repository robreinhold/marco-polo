#!/usr/bin/env python

import boto
import boto.cloudformation
import boto.ec2.autoscale
import requests

def main():
    ec2_conn = boto.ec2.connect_to_region("us-west-2")
    as_conn = boto.ec2.autoscale.connect_to_region("us-west-2")
    cf_conn = boto.cloudformation.connect_to_region("us-west-2")

    group_names = []
    for group_name in ["AliceGroup", "BarneyGroup", "CarlesGroup"]:
        scale_group = cf_conn.describe_stack_resource("reinhold-mp",group_name)
        detail = scale_group[u'DescribeStackResourceResponse'][u'DescribeStackResourceResult'][u'StackResourceDetail']
        group_id = detail[u'PhysicalResourceId']
        group_status = detail[u'ResourceStatus']
        print "Found {0} - {1}".format(group_id, group_status)
        group_detail = as_conn.get_all_groups(names=[group_id])[0]
        instance_ids = []
        for instance_ref in group_detail.instances:
            instance_ids.append(instance_ref.instance_id)

        for instance in ec2_conn.get_only_instances(instance_ids=instance_ids):
            url = "http://" + instance.private_ip_address + ":8080"
            print "Trying {0}".format(url)
            try:
                resp = requests.get(url)
                print resp
            except requests.exceptions.ConnectionError:
                print "No response: {0}".format(instance.private_ip_address)








if __name__ == '__main__':
    main()
