//   {
import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Bucket, BlockPublicAccess } from '@aws-cdk/aws-s3';
import { Distribution, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import * as Route53 from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';

export interface WebsiteStackProps extends StackProps {
  domainName: string;
  hostedZoneName: string;
  hostedZoneId: string;
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'WebsiteBucket', {
      bucketName: props.domainName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const zone = Route53.PublicHostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.hostedZoneName,
      }
    );

    const certificate = new DnsValidatedCertificate(this, 'WebsiteCert', {
      domainName: props.domainName,
      region: 'us-east-1',
      hostedZone: zone,
    });

    const distribution = new Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [props.domainName],
      certificate: certificate,
      defaultRootObject: 'index.html',
    });

    new Route53.ARecord(this, 'AliasRecord', {
      zone,
      recordName: props.domainName,
      target: Route53.RecordTarget.fromAlias(
        new CloudFrontTarget(distribution)
      ),
    });
  }
}
