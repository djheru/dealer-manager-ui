import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { WebsiteStack } from '../stacks/website';

export interface WebsiteStageProps extends StageProps {
  domainName: string;
  hostedZoneName: string;
}

export class WebsiteStage extends Stage {
  constructor(scope: Construct, id: string, props: WebsiteStageProps) {
    super(scope, id, props);

    new WebsiteStack(this, 'WebsiteStack', { ...props });
  }
}
