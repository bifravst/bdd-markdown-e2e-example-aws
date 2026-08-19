import { packLambdaFromPath } from '@bifravst/aws-cdk-lambda-helpers'
import { stackBaseName } from './stackBaseName.js'
import { TestApp } from './TestApp.js'

new TestApp({
	stackName: `${stackBaseName()}-test`,
	lambdaSource: await packLambdaFromPath({
		id: 'webhookReceiver',
		sourceFilePath: `lambda/webhookReceiver.ts`,
	}),
}).synth()
