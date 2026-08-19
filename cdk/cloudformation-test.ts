import { packLambdaFromPath } from '@bifravst/aws-cdk-lambda-helpers'
import { stackBaseName } from './stackBaseName.ts'
import { TestApp } from './TestApp.ts'

new TestApp({
	stackName: `${stackBaseName()}-test`,
	lambdaSource: await packLambdaFromPath({
		id: 'webhookReceiver',
		sourceFilePath: `lambda/webhookReceiver.ts`,
	}),
}).synth()
