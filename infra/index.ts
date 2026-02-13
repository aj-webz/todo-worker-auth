import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";


const repo = new awsx.ecr.Repository("todo-worker-repo", {
    name: "todo-worker-web",
    forceDelete: true,
});

const image = new awsx.ecr.Image("todo-image", {
    repositoryUrl: repo.url,
    context: "../",             
    dockerfile: "../Dockerfile",  
    platform: "linux/amd64",
});


const vpc = new awsx.ec2.Vpc("todo-vpc", {
    numberOfAvailabilityZones: 1,
});


const cluster = new aws.ecs.Cluster("todo-cluster");


const alb = new awsx.lb.ApplicationLoadBalancer("todo-alb", {
    subnetIds: vpc.publicSubnetIds,
    defaultTargetGroup: {
        port: 3000,
        protocol: "HTTP",
        targetType: "ip", 
    },
});

const service = new awsx.ecs.FargateService("todo-fargate-svc", {
    cluster: cluster.arn,
    assignPublicIp: true, 
    taskDefinitionArgs: {
        container: {
            name: "todo-web",
            image: image.imageUri,
            cpu: 256,
            memory: 512,
            essential: true,
            portMappings: [{
                containerPort: 3000,
                
                targetGroup: alb.defaultTargetGroup,
            }],
            environment: [
                { name: "DATABASE_URL", value: "postgresql://postgres.laasutudpwnjanedosch:AJAAY(2049)@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres" },
            ],
        },
    },
});

export const appUrl = alb.loadBalancer.dnsName;
export const ecrRepoUrl = repo.url;
