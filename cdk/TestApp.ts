import type { PackedLambda } from '@bifravst/aws-cdk-lambda-helpers'
import type { AppProps } from 'aws-cdk-lib'
import * as CDK from 'aws-cdk-lib'
import { WebhookReceiverStack } from './WebhookReceiverStack.js'

export class TestApp extends CDK.App {
	public constructor({
		stackName,
		context,
		lambdaSource,
	}: {
		stackName: string
		lambdaSource: PackedLambda
		context?: AppProps['context']
	}) {
		super({ context })
		new WebhookReceiverStack(this, stackName, { lambdaSource })
	}
}
