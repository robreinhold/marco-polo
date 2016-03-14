#!/usr/bin/env python

import boto
import boto.cloudformation
import boto.ec2.autoscale
import requests
import json

region = "us-west-2"
ec2_conn = boto.ec2.connect_to_region(region)
elb_conn = boto.ec2.elb.connect_to_region(region)
as_conn = boto.ec2.autoscale.connect_to_region(region)
cf_conn = boto.cloudformation.connect_to_region(region)

stack_name = "reinhold-mp"


def try_get(ip, port, path=''):
    try:
        url = "http://{0}:{1}/{2}".format(ip, port, path)
        resp = requests.get(url, timeout=2)
        print "-> {0} - {1} - {2}".format(url, resp.status_code, resp.content)
    except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout):
        print "No response: {0} - {1}".format(ip, url)

def get_instance_ids(stack_name, group_name):
    scale_group = cf_conn.describe_stack_resource(stack_name,group_name)
    detail = scale_group[u'DescribeStackResourceResponse'][u'DescribeStackResourceResult'][u'StackResourceDetail']
    group_id = detail[u'PhysicalResourceId']
    group_status = detail[u'ResourceStatus']
    print "\n{0} - {1}".format(detail[u'LogicalResourceId'], group_status)
    instance_ids = []
    if(group_id is not None):
        group_details = as_conn.get_all_groups(names=[group_id])
        for group_detail in group_details:
            for instance_ref in group_detail.instances:
                instance_ids.append(instance_ref.instance_id)
    return instance_ids

def fetch_alice_ips_from_consul(consul_ip, node_list):
    url = "http://{0}:{1}/{2}".format(consul_ip, 8500, "v1/health/service/alice")
    resp = requests.get(url, timeout=2)
    health = json.loads(resp.text)
    for entry in health:
        if(entry[u'Service'][u'Service'] == u'alice'):
            node_list.append(entry[u'Node'][u'Address'])
    return node_list

def main():
    # check_consul()

    # Cross-check alice group IPs with Consul node IPs
    alice_sg_ips = []
    alice_consul_ips = []

    for stack_resource in cf_conn.describe_stack_resources(stack_name_or_id=stack_name):
        if(stack_resource.resource_type == u'AWS::ElasticLoadBalancing::LoadBalancer'):
            for elb in elb_conn.get_all_load_balancers(stack_resource.physical_resource_id):
                print "\nELB: {}".format(stack_resource.physical_resource_id)
                for listener in elb.listeners:
                    print "http://{}:{}".format(elb.dns_name, listener.load_balancer_port)
        elif(stack_resource.resource_type == u'AWS::EC2::Instance'):
            instance = ec2_conn.get_only_instances(instance_ids=stack_resource.physical_resource_id)[0]
            print "\n{}\n{}".format(stack_resource.logical_resource_id, instance.private_ip_address)
            alice_consul_ips = fetch_alice_ips_from_consul(instance.private_ip_address,alice_consul_ips)
        elif(stack_resource.resource_type == u'AWS::AutoScaling::AutoScalingGroup'):
            instance_ids = get_instance_ids(stack_name=stack_name, group_name=stack_resource.logical_resource_id)
            if(len(instance_ids) > 0):
                instance_count = 0
                for instance in ec2_conn.get_only_instances(instance_ids=instance_ids):
                    alice_sg_ips.append(instance.private_ip_address)
                    print instance.private_ip_address
                    try_get(instance.private_ip_address,8080,'ping')
                    instance_count += 1
                print "Total: {}".format(instance_count)





if __name__ == '__main__':
    main()
