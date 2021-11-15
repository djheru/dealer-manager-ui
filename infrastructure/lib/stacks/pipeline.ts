import * as Codepipeline from '@aws-cdk/aws-codepipeline';
import * as CodepipelineActions from '@aws-cdk/aws-codepipeline-actions';
import {
  // CfnOutput,
  Construct,
  SecretValue,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from '@aws-cdk/pipelines';
import * as CodeBuild from '@aws-cdk/aws-codebuild';
import { Bucket } from '@aws-cdk/aws-s3';
import { WebsiteStage } from '../stages/website';

export type Environment = 'dev' | 'prod' | 'staging' | 'test' | string;

export interface PipelineStackProps extends StackProps {
  environmentName: Environment;
  domainName: string;
  hostedZoneName: string;
}

export class PipelineStack extends Stack {
  constructor(
    scope: Construct,
    public readonly id: string,
    private readonly props: PipelineStackProps
  ) {
    super(scope, id, props);

    const pipeline = this.buildCodePipeline();

    const websiteInfrastructureStage = new WebsiteStage(
      this,
      'WebsiteInfrastructureStage',
      props
    );

    pipeline.addStage(websiteInfrastructureStage);
  }

  private buildCodePipeline() {
    return new CodePipeline(this, 'Pipeline', {
      pipelineName: `${this.id}-pipeline`,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('djheru/dealer-manager-ui', 'main', {
          authentication: SecretValue.secretsManager('personal-github-token'),
        }),
        commands: [
          'cd ./infrastructure',
          'ls -laht',
          'yarn install --frozen-lockfile',
          'yarn build',
          'yarn cdk synth',
        ],
      }),
    });
  }

  private buildAction(
    sourceArtifact: Codepipeline.Artifact,
    buildArtifact: Codepipeline.Artifact,
    runOrder: number
  ): CodepipelineActions.CodeBuildAction {
    return new CodepipelineActions.CodeBuildAction({
      input: sourceArtifact,
      outputs: [buildArtifact],
      runOrder: runOrder,
      actionName: 'Build',
      project: new CodeBuild.PipelineProject(this, 'StaticSiteBuildProject', {
        projectName: 'StaticSiteBuildProject',
        buildSpec: CodeBuild.BuildSpec.fromSourceFilename(
          'website/buildspec.yml'
        ),
        environment: {
          buildImage: CodeBuild.LinuxBuildImage.STANDARD_4_0,
        },
      }),
    });
  }

  private deployAction(
    input: Codepipeline.Artifact,
    bucketName: string,
    runOrder: number
  ): CodepipelineActions.S3DeployAction {
    const bucket = Bucket.fromBucketName(this, 'WebsiteBucket', bucketName);

    return new CodepipelineActions.S3DeployAction({
      actionName: 'Deploy',
      runOrder: runOrder,
      input: input,
      bucket: bucket,
    });
  }
}
